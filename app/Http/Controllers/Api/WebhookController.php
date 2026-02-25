<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class WebhookController extends Controller
{
    /**
     * Handle Stripe webhook events
     */
    public function handleStripe(Request $request)
    {
        $sig_header = $request->header('Stripe-Signature');
        $body = $request->getContent();
        
        try {
            $event = Webhook::constructEvent(
                $body,
                $sig_header,
                config('services.stripe.webhook_secret')
            );
        } catch (SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 403);
        } catch (\UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        // Handle different event types
        match($event->type) {
            'payment_intent.succeeded' => $this->handlePaymentIntentSucceeded($event),
            'payment_intent.payment_failed' => $this->handlePaymentIntentFailed($event),
            'charge.refunded' => $this->handleChargeRefunded($event),
            default => null,
        };

        return response()->json(['status' => 'received']);
    }

    /**
     * Handle successful Stripe payment
     */
    private function handlePaymentIntentSucceeded($event)
    {
        $paymentIntent = $event->data->object;
        
        // Find donation by metadata
        $donorEmail = $paymentIntent->metadata->donor_email ?? null;
        $amount = $paymentIntent->amount / 100; // Convert cents to dollars

        if ($donorEmail) {
            // Find and update the most recent pending donation
            $donation = Donation::where('donor_email', $donorEmail)
                ->where('amount', $amount)
                ->where('status', 'pending')
                ->where('payment_method', 'stripe')
                ->latest()
                ->first();

            if ($donation) {
                $donation->update([
                    'status' => 'completed',
                ]);

                // Log the webhook event
                \Log::info("Stripe webhook: Payment succeeded for donation {$donation->id}");
            }
        }
    }

    /**
     * Handle failed Stripe payment
     */
    private function handlePaymentIntentFailed($event)
    {
        $paymentIntent = $event->data->object;
        
        $donorEmail = $paymentIntent->metadata->donor_email ?? null;
        $amount = $paymentIntent->amount / 100;

        if ($donorEmail) {
            $donation = Donation::where('donor_email', $donorEmail)
                ->where('amount', $amount)
                ->where('status', 'pending')
                ->where('payment_method', 'stripe')
                ->latest()
                ->first();

            if ($donation) {
                $donation->update([
                    'status' => 'failed',
                ]);

                \Log::warning("Stripe webhook: Payment failed for donation {$donation->id}");
            }
        }
    }

    /**
     * Handle refunds
     */
    private function handleChargeRefunded($event)
    {
        $charge = $event->data->object;
        
        $donorEmail = $charge->metadata->donor_email ?? null;

        if ($donorEmail && $charge->refunded) {
            $donation = Donation::where('donor_email', $donorEmail)
                ->where('status', 'completed')
                ->where('payment_method', 'stripe')
                ->latest()
                ->first();

            if ($donation) {
                // Mark as refunded (could add a refunded status in migration)
                $donation->update([
                    'status' => 'failed', // Or create 'refunded' status
                ]);

                \Log::info("Stripe webhook: Payment refunded for donation {$donation->id}");
            }
        }
    }

    /**
     * Handle PayPal webhook events
     */
    public function handlePayPal(Request $request)
    {
        try {
            // Verify PayPal webhook signature
            $headers = $request->headers->all();
            $body = $request->getContent();

            // For production, verify the webhook signature with PayPal
            // For now, we'll process based on event type
            $data = json_decode($body, true);

            if (!isset($data['event_type'])) {
                return response()->json(['error' => 'Invalid webhook'], 400);
            }

            match($data['event_type']) {
                'CHECKOUT.ORDER.APPROVED' => $this->handlePayPalOrderApproved($data),
                'PAYMENT.SALE.COMPLETED' => $this->handlePayPalSaleCompleted($data),
                'PAYMENT.SALE.DENIED' => $this->handlePayPalSaleDenied($data),
                'PAYMENT.SALE.REFUNDED' => $this->handlePayPalSaleRefunded($data),
                default => null,
            };

            return response()->json(['status' => 'received']);
        } catch (\Exception $e) {
            \Log::error("PayPal webhook error: " . $e->getMessage());
            return response()->json(['error' => 'Webhook processing error'], 500);
        }
    }

    /**
     * Handle PayPal order approved
     */
    private function handlePayPalOrderApproved($data)
    {
        $purchaseUnits = $data['resource']['purchase_units'][0] ?? null;
        
        if (!$purchaseUnits) {
            return;
        }

        $amount = $purchaseUnits['amount']['value'] ?? null;
        $payerEmail = $data['resource']['payer']['email_address'] ?? null;

        if ($amount && $payerEmail) {
            // Update the donation record
            $donation = Donation::where('donor_email', $payerEmail)
                ->where('amount', $amount)
                ->where('status', 'pending')
                ->where('payment_method', 'paypal')
                ->latest()
                ->first();

            if ($donation) {
                $donation->update([
                    'status' => 'completed',
                ]);

                \Log::info("PayPal webhook: Order approved for donation {$donation->id}");
            }
        }
    }

    /**
     * Handle completed PayPal sale
     */
    private function handlePayPalSaleCompleted($data)
    {
        $saleDetails = $data['resource'] ?? null;
        
        if (!$saleDetails) {
            return;
        }

        $amount = $saleDetails['amount'] ?? null;
        $payerEmail = $saleDetails['payer']['email'] ?? null;

        if ($amount && $payerEmail) {
            $donation = Donation::where('donor_email', $payerEmail)
                ->where('amount', $amount)
                ->where('status', 'pending')
                ->where('payment_method', 'paypal')
                ->latest()
                ->first();

            if ($donation) {
                $donation->update([
                    'status' => 'completed',
                ]);

                \Log::info("PayPal webhook: Sale completed for donation {$donation->id}");
            }
        }
    }

    /**
     * Handle denied PayPal sale
     */
    private function handlePayPalSaleDenied($data)
    {
        $saleDetails = $data['resource'] ?? null;
        
        if (!$saleDetails) {
            return;
        }

        $amount = $saleDetails['amount'] ?? null;
        $payerEmail = $saleDetails['payer']['email'] ?? null;

        if ($amount && $payerEmail) {
            $donation = Donation::where('donor_email', $payerEmail)
                ->where('amount', $amount)
                ->where('status', 'pending')
                ->where('payment_method', 'paypal')
                ->latest()
                ->first();

            if ($donation) {
                $donation->update([
                    'status' => 'failed',
                ]);

                \Log::warning("PayPal webhook: Sale denied for donation {$donation->id}");
            }
        }
    }

    /**
     * Handle PayPal refund
     */
    private function handlePayPalSaleRefunded($data)
    {
        $refundDetails = $data['resource'] ?? null;
        
        if (!$refundDetails) {
            return;
        }

        $amount = $refundDetails['amount'] ?? null;
        $payerEmail = $refundDetails['payer']['email'] ?? null;

        if ($amount && $payerEmail) {
            $donation = Donation::where('donor_email', $payerEmail)
                ->where('amount', $amount)
                ->where('status', 'completed')
                ->where('payment_method', 'paypal')
                ->latest()
                ->first();

            if ($donation) {
                $donation->update([
                    'status' => 'failed',
                ]);

                \Log::info("PayPal webhook: Sale refunded for donation {$donation->id}");
            }
        }
    }

    /**
     * Test webhook endpoint (for verification)
     */
    public function testWebhook(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Webhook endpoint is active and accessible',
            'timestamp' => now(),
        ]);
    }
}
