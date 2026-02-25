<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Re: {{ $contactMessage->subject }}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Thank You for Contacting Us</h2>
        
        <p>Hello {{ $contactMessage->name }},</p>
        
        <p>Thank you for reaching out to <strong>The Shepherds Community Centre Resurrection</strong>. We appreciate your message and have sent you a reply below:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
            <h4 style="margin-top: 0;">Your Original Message:</h4>
            <p><strong>Subject:</strong> {{ $contactMessage->subject }}</p>
            <p style="white-space: pre-wrap;">{{ $contactMessage->message }}</p>
        </div>
        
        <div style="background-color: #d1fae5; padding: 15px; border-left: 4px solid #22c55e; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #166534;">Our Reply:</h4>
            <p style="white-space: pre-wrap; color: #065f46;">{{ $contactMessage->reply }}</p>
        </div>
        
        <p>If you have any further questions, please feel free to reach out to us again.</p>
        
        <p>Best Regards,<br>
        <strong>The Shepherds Community Centre Resurrection Team</strong></p>
        
        <hr>
        
        <p style="font-size: 12px; color: #666;">
            📍 Location: Brgy. Holy Redeemer P-8, Butuan City, Agusan del Norte, Philippines<br>
            📞 Phone: (+63) 991-935-7954<br>
            📧 Email: tsccresurrection@gmail.com
        </p>
    </div>
</body>
</html>
