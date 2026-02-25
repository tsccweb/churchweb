<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsletterBroadcast extends Mailable
{
    use Queueable, SerializesModels;

    public string $subject;
    public string $content;
    public string $email;

    public function __construct(string $subject, string $content, string $email)
    {
        $this->subject = $subject;
        $this->content = $content;
        $this->email = $email;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: $this->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.newsletter-broadcast',
            with: [
                'subject' => $this->subject,
                'content' => $this->content,
                'email' => $this->email,
                'unsubscribeLink' => url('/api/v1/newsletter/unsubscribe?email=' . urlencode($this->email)),
            ],
        );
    }
}
