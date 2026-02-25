<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PayPal Payment Approval - Test Mode</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 100%;
            padding: 40px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .paypal-logo {
            font-size: 40px;
            margin-bottom: 15px;
        }
        
        h1 {
            font-size: 24px;
            color: #333;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            font-size: 14px;
        }
        
        .test-badge {
            display: inline-block;
            background: #ffc107;
            color: #000;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 10px;
        }
        
        .donation-details {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            line-height: 1.6;
        }
        
        .detail-row:last-child {
            margin-bottom: 0;
        }
        
        .detail-label {
            color: #666;
            font-size: 14px;
        }
        
        .detail-value {
            color: #333;
            font-weight: 600;
            text-align: right;
        }
        
        .amount {
            font-size: 20px;
            color: #667eea;
        }
        
        .separator {
            height: 1px;
            background: #ddd;
            margin: 20px 0;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            background: #f0f4ff;
            padding: 12px;
            border-radius: 6px;
        }
        
        .total-label {
            color: #667eea;
            font-weight: 600;
        }
        
        .total-value {
            color: #667eea;
            font-weight: 700;
            font-size: 18px;
        }
        
        .actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 30px;
        }
        
        .btn {
            padding: 14px 20px;
            border-radius: 6px;
            border: none;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .btn-approve {
            background: #0070ba;
            color: white;
        }
        
        .btn-approve:hover {
            background: #005a94;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 112, 186, 0.3);
        }
        
        .btn-cancel {
            background: #f0f0f0;
            color: #333;
            border: 1px solid #ddd;
        }
        
        .btn-cancel:hover {
            background: #e8e8e8;
            transform: translateY(-2px);
        }
        
        .info-box {
            background: #e8f4f8;
            border-left: 4px solid #0070ba;
            padding: 12px;
            border-radius: 4px;
            margin-top: 20px;
            font-size: 13px;
            color: #0a5a7a;
        }
        
        .info-box strong {
            color: #003f5c;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="paypal-logo">🅿️ PayPal</div>
            <h1>Confirm Your Donation</h1>
            <p class="subtitle">Review and approve your donation</p>
            <span class="test-badge">TEST MODE</span>
        </div>
        
        <div class="donation-details">
            <div class="detail-row">
                <span class="detail-label">Donor Name</span>
                <span class="detail-value">{{ $donation->donor_name }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email</span>
                <span class="detail-value">{{ $donation->donor_email }}</span>
            </div>
            
            <div class="separator"></div>
            
            <div class="total-row">
                <span class="total-label">Donation Amount</span>
                <span class="total-value amount">${{ number_format($donation->amount, 2) }}</span>
            </div>
        </div>
        
        <div class="info-box">
            <strong>ℹ️ Test Mode Notice:</strong> This is a test payment approval page. In production, you would be redirected to the real PayPal website.
        </div>
        
        <div class="actions">
            <form action="{{ route('donations.paypal-return', ['donation_id' => $donation->id]) }}" method="GET" style="width: 100%;">
                <button type="submit" class="btn btn-approve">
                    <span>✓</span> Approve
                </button>
            </form>
            <form action="{{ route('donations.paypal-cancel', ['donation_id' => $donation->id]) }}" method="GET" style="width: 100%;">
                <button type="submit" class="btn btn-cancel">
                    Cancel
                </button>
            </form>
        </div>
    </div>
</body>
</html>
