<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsletterSubscriptionConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public string $email;
    public string $unsubscribeLink;

    public function __construct(string $email)
    {
        $this->email = $email;
        $this->unsubscribeLink = url('/api/v1/newsletter/unsubscribe?email=' . urlencode($email));
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Welcome to TSCC Resurrection Newsletter',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.newsletter-confirmation',
            with: [
                'email' => $this->email,
                'unsubscribeLink' => $this->unsubscribeLink,
            ],
        );
    }
}
