<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 4px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .footer { font-size: 12px; color: #666; text-align: center; padding: 20px; border-top: 1px solid #e5e7eb; }
        a { color: #2563eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to TSCC Resurrection</h1>
        </div>
        
        <div class="content">
            <h2>Thank you for subscribing!</h2>
            <p>Welcome to The Shepherds Community Centre Resurrection newsletter. You'll now receive updates about:</p>
            <ul>
                <li>Upcoming events and services</li>
                <li>Weekly sermons and teachings</li>
                <li>Ministry announcements</li>
                <li>Community notices</li>
            </ul>
            <p>We're excited to keep you connected with our community!</p>
        </div>

        <div class="footer">
            <p>The Shepherds Community Centre - Resurrection</p>
            <p>Email: tsccresurrection@gmail.com</p>
            <p><a href="{{ $unsubscribeLink }}">Unsubscribe from newsletter</a></p>
            <p>&copy; 2026 TSCC. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
