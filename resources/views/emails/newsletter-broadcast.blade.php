<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 4px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; margin: 20px 0; border-radius: 4px; line-height: 1.6; }
        .footer { font-size: 12px; color: #666; text-align: center; padding: 20px; border-top: 1px solid #e5e7eb; }
        a { color: #2563eb; }
        .divider { height: 1px; background-color: #e5e7eb; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ $subject }}</h1>
        </div>
        
        <div class="content">
            {!! nl2br(htmlspecialchars($content)) !!}
        </div>

        <div class="divider"></div>

        <div class="footer">
            <p>The Shepherds Community Centre - Resurrection</p>
            <p>Email: tsccresurrection@gmail.com | Phone: +63 (991) 935-7954</p>
            <p><a href="{{ $unsubscribeLink }}">Unsubscribe from newsletter</a></p>
            <p>&copy; 2026 TSCC. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
