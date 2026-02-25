<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Mail\ContactReply as ContactReplyMail;
use App\Mail\NewsletterSubscriptionConfirmation;
use App\Mail\NewsletterBroadcast;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'phone' => 'nullable|string',
        ]);

        $validated['status'] = 'new';
        $validated['ip_address'] = $request->ip();
        
        $message = ContactMessage::create($validated);

        // TODO: Send email notification to admin
        // Mail::to(config('mail.admin_email'))->send(new ContactFormSubmitted($message));

        return response()->json($message, Response::HTTP_CREATED);
    }

    public function index(Request $request)
    {
        $limit = $request->input('limit', 10);
        $messages = ContactMessage::paginate($limit);

        return response()->json($messages);
    }

    public function markAsRead($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->update(['status' => 'read']);

        return response()->json($message);
    }

    public function reply(Request $request, $id)
    {
        $message = ContactMessage::findOrFail($id);

        $validated = $request->validate([
            'reply' => 'required|string',
        ]);

        $message->update([
            'reply' => $validated['reply'],
            'replied_at' => now(),
            'status' => 'replied',
            'replied_by' => auth()->id(),
        ]);

        // Send email reply to the contact
        try {
            Mail::to($message->email)->send(new ContactReplyMail($message));
        } catch (\Exception $e) {
            // Log the error but still return success so the reply is saved
            \Log::error('Failed to send contact reply email: ' . $e->getMessage());
        }

        return response()->json($message);
    }

    public function destroy($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Subscribe to newsletter
     */
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        // Store as newsletter subscription via ContactMessage
        $subscription = ContactMessage::create([
            'email' => $validated['email'],
            'name' => 'Newsletter Subscriber',
            'subject' => 'Newsletter Subscription',
            'message' => 'User subscribed to newsletter',
            'status' => 'newsletter',
            'ip_address' => $request->ip(),
        ]);

        // Send confirmation email
        try {
            Mail::to($validated['email'])->send(new NewsletterSubscriptionConfirmation($validated['email']));
        } catch (\Exception $e) {
            \Log::error('Failed to send newsletter confirmation email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Successfully subscribed to our newsletter. Check your email for confirmation!',
            'data' => $subscription
        ], 201);
    }

    /**
     * Unsubscribe from newsletter
     */
    public function unsubscribe(Request $request)
    {
        $email = $request->query('email');

        if (!$email) {
            return response()->json(['message' => 'Email parameter required'], 400);
        }

        // Mark newsletter subscription as archived
        ContactMessage::where('email', $email)
            ->where('status', 'newsletter')
            ->update(['status' => 'archived']);

        return response()->json([
            'message' => 'You have been unsubscribed from our newsletter'
        ]);
    }

    /**
     * Get newsletter subscribers - Admin only
     */
    public function getSubscribers(Request $request)
    {
        $limit = $request->integer('limit', 50);

        $subscribers = ContactMessage::where('status', 'newsletter')
            ->orderBy('created_at', 'desc')
            ->paginate($limit);

        return response()->json($subscribers);
    }

    /**
     * Send newsletter to all subscribers - Admin only
     */
    public function sendNewsletter(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        // Get all active newsletter subscribers
        $subscribers = ContactMessage::where('status', 'newsletter')->pluck('email');

        if ($subscribers->isEmpty()) {
            return response()->json(['message' => 'No subscribers found'], 404);
        }

        $sent = 0;
        $failed = 0;

        foreach ($subscribers as $email) {
            try {
                Mail::to($email)->send(new NewsletterBroadcast(
                    $validated['subject'],
                    $validated['content'],
                    $email
                ));
                $sent++;
            } catch (\Exception $e) {
                \Log::error('Failed to send newsletter to ' . $email . ': ' . $e->getMessage());
                $failed++;
            }
        }

        return response()->json([
            'message' => 'Newsletter sent successfully',
            'sent' => $sent,
            'failed' => $failed,
            'total' => $subscribers->count()
        ]);
    }
}

