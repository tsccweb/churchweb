<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class DonationController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'donor_name' => 'required|string|max:255',
            'donor_email' => 'required|email',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|max:3',
            'payment_method' => 'nullable|string',
        ]);

        $validated['status'] = 'pending';
        $donation = Donation::create($validated);

        return response()->json($donation, Response::HTTP_CREATED);
    }

    public function paymentIntent(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'donor_name' => 'required|string|max:255',
            'donor_email' => 'required|email',
        ]);

        try {
            // If using real Stripe keys, create actual payment intent
            if (config('services.stripe.secret') && !str_contains(config('services.stripe.secret'), 'test')) {
                $amountInCents = (int)($validated['amount'] * 100);

                $paymentIntent = PaymentIntent::create([
                    'amount' => $amountInCents,
                    'currency' => 'usd',
                    'metadata' => [
                        'donor_name' => $validated['donor_name'],
                        'donor_email' => $validated['donor_email'],
                    ],
                ]);

                return response()->json([
                    'client_secret' => $paymentIntent->client_secret,
                    'amount' => $validated['amount'],
                ]);
            } else {
                // For testing with test keys - return mock response
                // In production, use real Stripe keys
                return response()->json([
                    'client_secret' => 'pi_test_' . bin2hex(random_bytes(16)) . '_secret_' . bin2hex(random_bytes(16)),
                    'amount' => $validated['amount'],
                    'test_mode' => true,
                    'note' => 'Using test Stripe keys. Replace with production keys for real payments.',
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 400);
        }
    }

    public function paypalCheckout(Request $request)
    {
        $validated = $request->validate([
            'donor_name' => 'required|string|max:255',
            'donor_email' => 'required|email',
            'amount' => 'required|numeric|min:0.01',
        ]);

        try {
            // Create donation record with pending status
            $donation = Donation::create([
                'donor_name' => $validated['donor_name'],
                'donor_email' => $validated['donor_email'],
                'amount' => $validated['amount'],
                'currency' => 'USD',
                'payment_method' => 'paypal',
                'status' => 'pending',
            ]);

            // Return donation details and PayPal instructions
            return response()->json([
                'success' => true,
                'donation_id' => $donation->id,
                'amount' => $donation->amount,
                'donor_name' => $donation->donor_name,
                'mode' => 'instructions',
                'message' => 'Please send your donation to the PayPal address shown below',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 400);
        }
    }

    public function paypalApprove(Request $request)
    {
        $donationId = $request->input('donation_id');
        $donation = Donation::find($donationId);

        if (!$donation) {
            return redirect(config('app.frontend_url', 'http://localhost:5173') . '/donate?error=donation_not_found');
        }

        // This is the test approval page - in production, PayPal would redirect here
        return view('paypal-approve', [
            'donation' => $donation,
        ]);
    }

    public function paypalReturn(Request $request)
    {
        $donationId = $request->input('donation_id');
        $token = $request->input('token'); // PayPal sends this after approval
        $donation = Donation::find($donationId);

        if (!$donation) {
            return redirect(config('app.frontend_url', 'http://localhost:5173') . '/donate?error=donation_not_found');
        }

        // Check if this is a real PayPal payment or test payment
        $paypalOrderId = $donation->metadata['paypal_order_id'] ?? null;

        if ($paypalOrderId && $token) {
            // Real PayPal payment - capture the order
            try {
                $paypalClientId = config('services.paypal.client_id');
                $paypalSecret = config('services.paypal.secret');
                $paypalMode = config('services.paypal.mode', 'sandbox');

                $paypalApiUrl = $paypalMode === 'live' 
                    ? 'https://api.paypal.com'
                    : 'https://api.sandbox.paypal.com';

                // Get access token
                $tokenResponse = $this->getPayPalAccessToken($paypalClientId, $paypalSecret, $paypalApiUrl);
                $accessToken = $tokenResponse['access_token'] ?? null;

                if (!$accessToken) {
                    throw new \Exception('Failed to get PayPal access token');
                }

                // Capture the payment
                $captureResponse = $this->capturePayPalOrder($paypalOrderId, $paypalApiUrl, $accessToken);

                if ($captureResponse['status'] === 'COMPLETED') {
                    // Payment captured successfully
                    $donation->update([
                        'status' => 'completed',
                        'transaction_id' => $paypalOrderId,
                    ]);
                } else {
                    throw new \Exception('PayPal payment not completed: ' . json_encode($captureResponse));
                }
            } catch (\Exception $e) {
                // Mark as failed if capture fails
                $donation->update(['status' => 'failed']);
                $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
                return redirect("{$frontendUrl}/donate?error=" . urlencode($e->getMessage()));
            }
        } else {
            // Test payment mode - just mark as completed
            $donation->update(['status' => 'completed']);
        }

        // Redirect to frontend success page
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        return redirect("{$frontendUrl}/donate?success=true&donation_id={$donationId}&amount={$donation->amount}");
    }

    public function paypalCancel(Request $request)
    {
        $donationId = $request->input('donation_id');
        $donation = Donation::find($donationId);

        if ($donation) {
            // Mark as failed (user cancelled)
            $donation->update(['status' => 'failed']);
        }

        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        return redirect("{$frontendUrl}/donate?cancelled=true");
    }

    public function publicStats()
    {
        $totalDonated = Donation::where('status', 'completed')->sum('amount');
        $donationCount = Donation::where('status', 'completed')->count();

        return response()->json([
            'total_donated' => $totalDonated,
            'donation_count' => $donationCount,
        ]);
    }

    private function getPayPalAccessToken($clientId, $secret, $apiUrl)
    {
        $response = Http::withBasicAuth($clientId, $secret)
            ->post("{$apiUrl}/v1/oauth2/token", [
                'grant_type' => 'client_credentials',
            ]);

        return $response->json();
    }

    private function createPayPalOrder($orderData, $apiUrl, $accessToken)
    {
        $response = Http::withToken($accessToken)
            ->post("{$apiUrl}/v2/checkout/orders", $orderData);

        return $response->json();
    }

    private function capturePayPalOrder($orderId, $apiUrl, $accessToken)
    {
        $response = Http::withToken($accessToken)
            ->post("{$apiUrl}/v2/checkout/orders/{$orderId}/capture", []);

        return $response->json();
    }

    public function index(Request $request)
    {
        $limit = $request->input('limit', 10);
        $donations = Donation::paginate($limit);

        return response()->json($donations);
    }

    public function show($id)
    {
        $donation = Donation::findOrFail($id);
        return response()->json($donation);
    }

    public function update(Request $request, $id)
    {
        $donation = Donation::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,failed',
            'donor_name' => 'sometimes|string|max:255',
            'donor_email' => 'sometimes|email',
            'amount' => 'sometimes|numeric|min:0.01',
        ]);

        $donation->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Donation updated successfully',
            'donation' => $donation,
        ]);
    }

    public function export()
    {
        // Export donations as CSV
        $donations = Donation::all();
        
        $csv = "Donor Name,Email,Amount,Currency,Status,Date\n";
        foreach ($donations as $donation) {
            $csv .= "\"{$donation->donor_name}\",\"{$donation->donor_email}\",{$donation->amount},{$donation->currency},{$donation->status},{$donation->created_at}\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="donations.csv"');
    }
}
