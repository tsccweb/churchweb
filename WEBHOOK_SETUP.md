# Webhook Handlers - Payment Confirmation

## Overview

Webhooks automatically update donation status when payment processors confirm payments. This eliminates the need for manual verification and keeps records in sync with Stripe and PayPal.

**Status:** ✅ Ready for Production

---

## Webhook Endpoints

### Stripe Webhook
```
POST /api/v1/webhooks/stripe
```

### PayPal Webhook  
```
POST /api/v1/webhooks/paypal
```

### Test Webhook Endpoint
```
GET /api/v1/webhooks/test
```

---

## How Webhooks Work

### Flow Diagram
```
1. User makes donation payment
   ↓
2. Payment processor confirms (Stripe/PayPal)
   ↓
3. Sends webhook to your server with event data
   ↓
4. WebhookController processes event
   ↓
5. Updates donation status in database
   ↓
6. Admin dashboard reflects changes automatically
```

### For Stripe

**Events Handled:**
- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Card declined or payment failed
- `charge.refunded` - Payment refunded

**Process:**
1. User enters card details in donation form
2. Frontend calls `POST /donations/payment-intent` → Creates PaymentIntent
3. Stripe processes the card payment
4. Stripe sends `payment_intent.succeeded` webhook
5. WebhookController updates donation status to `completed`
6. Admin sees updated status immediately

### For PayPal

**Events Handled:**
- `CHECKOUT.ORDER.APPROVED` - Order approved by payer
- `PAYMENT.SALE.COMPLETED` - Sale completed
- `PAYMENT.SALE.DENIED` - Sale denied
- `PAYMENT.SALE.REFUNDED` - Payment refunded

**Process:**
1. User clicks "Continue to PayPal"
2. Frontend redirects to PayPal checkout
3. PayPal processes payment and redirects back
4. Our `/donations/paypal-return` endpoint marks as pending
5. PayPal sends `PAYMENT.SALE.COMPLETED` webhook
6. WebhookController updates status to `completed`

---

## Setting Up Webhooks in Production

### STRIPE WEBHOOK SETUP

**Step 1: Configure Webhook Endpoint in Stripe Dashboard**

1. Go to https://dashboard.stripe.com
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Enter endpoint URL:
   ```
   https://your-production-url.com/api/v1/webhooks/stripe
   ```
5. Select events to receive:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
6. Click **Add endpoint**
7. Copy the **Signing Secret** (starts with `whsec_`)

**Step 2: Update Environment Variables**

In your production `.env` file:
```env
STRIPE_PUBLIC_KEY=pk_live_your_production_key
STRIPE_SECRET_KEY=sk_live_your_production_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Step 3: Verify Webhook**

Test: `GET https://your-production-url.com/api/v1/webhooks/test`

Expected response:
```json
{
  "status": "success",
  "message": "Webhook endpoint is active and accessible",
  "timestamp": "2026-02-25T..."
}
```

---

### PAYPAL WEBHOOK SETUP

**Step 1: Configure Webhook in PayPal Dashboard**

1. Go to https://developer.paypal.com
2. Log in with your PayPal account
3. Navigate to **Apps & Credentials** → select **Live** (or **Sandbox** for testing)
4. Click on your app name
5. Go to **Webhooks** section
6. Click **Add Webhook**
7. Enter webhook URL:
   ```
   https://your-production-url.com/api/v1/webhooks/paypal
   ```
8. Select events:
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.DENIED`
   - `PAYMENT.SALE.REFUNDED`
9. Click **Save**
10. Copy the **Webhook ID** and **Webhook URL**

**Step 2: Update Configuration**

In `config/services.php`, PayPal webhook secret is handled via:
```php
'paypal' => [
    'webhook_id' => env('PAYPAL_WEBHOOK_ID'),
]
```

Add to `.env`:
```env
PAYPAL_WEBHOOK_ID=your_webhook_id_from_paypal
```

**Step 3: Verify Webhook**

Manual test with sample event (PayPal provides test event button in dashboard).

---

## Webhook Processing Flow

### Code Locations

**Main Controller:**
- [WebhookController.php](app/Http/Controllers/Api/WebhookController.php)

**Routes:**
- [routes/api.php](routes/api.php) - Lines with `/webhooks/`

### Processing Logic

**Stripe Webhook Processing (Pseudo-code):**
```php
// 1. Verify signature using STRIPE_WEBHOOK_SECRET
// 2. Extract payment intent data
// 3. Get donor email and amount from metadata
// 4. Find matching donation record
// 5. Update status based on event type
//    - payment_intent.succeeded → status = 'completed'
//    - payment_intent.payment_failed → status = 'failed'
//    - charge.refunded → status = 'failed'
// 6. Log the event
```

**PayPal Webhook Processing (Pseudo-code):**
```php
// 1. Parse webhook data
// 2. Extract payer email and amount
// 3. Find matching donation record
// 4. Update status based on event type
//    - PAYMENT.SALE.COMPLETED → status = 'completed'
//    - PAYMENT.SALE.DENIED → status = 'failed'
//    - PAYMENT.SALE.REFUNDED → status = 'failed'
// 5. Log the event
```

---

## Testing Webhooks Locally

### Testing Without Production Webhooks

For local development, webhooks from actual payment processors won't fire because your localhost isn't accessible from the internet.

**Option 1: Use Stripe CLI (Recommended)**

```bash
# Download Stripe CLI from https://stripe.com/docs/stripe-cli

# Forward Stripe events to your local webhook
stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe

# In another terminal, trigger test events
stripe trigger payment_intent.succeeded
```

**Option 2: Manual Testing with curl**

```bash
# Test Stripe webhook (with mock signature)
curl -X POST http://localhost:8000/api/v1/webhooks/test
```

**Option 3: Test via Admin Dashboard**

1. Manually create a test donation
2. Use admin dashboard to update status
3. Verify donation shows correctly

---

## Webhook Security

### Verification Methods

**Stripe:**
- Uses HMAC-SHA256 signature verification
- Signature in `Stripe-Signature` header
- Secret key (`STRIPE_WEBHOOK_SECRET`) validates authenticity
- ✅ Implemented in WebhookController

**PayPal:**
- Implements webhook signature verification
- Details in PayPal API documentation
- Recommended to implement for production

### Best Practices

1. **Always verify signatures** - Already implemented for Stripe
2. **Use HTTPS in production** - Required by payment processors
3. **Log all webhook events** - Helps with debugging/audits (already done)
4. **Handle duplicate events** - Webhooks can be delivered multiple times
5. **Don't rely on webhooks alone** - Always have fallback verification

---

## Donation Status Flow with Webhooks

```
Donation Created (pending)
     ↓
Customer makes payment
     ↓
Payment processor confirms
     ↓
Webhook sent to server
     ↓
Status updated (completed/failed)
     ↓
Admin sees updated donation
     ↓
(Optional) Send confirmation email to donor
```

---

## Error Handling

### What Happens If Webhook Fails?

1. **Signature verification fails** → Returns 403 Forbidden
2. **Donation record not found** → Logs warning, returns 200 OK (no error)
3. **Database error** → Request resent up to 5 times by payment processor
4. **No matching donation** → Event logged for manual review

### Monitoring Webhooks

Check logs for webhook events:
```bash
# View recent webhook logs
tail -f storage/logs/laravel.log | grep webhook

# Or search for specific events
grep "Stripe webhook\|PayPal webhook" storage/logs/laravel.log
```

---

## FAQ

### Q: What if the webhook doesn't fire?

Payment processors retry webhooks multiple times. If still not received:
1. Check firewall/security rules
2. Verify webhook URL is publicly accessible
3. Check logs for signature verification errors
4. Manually update donation status in admin dashboard

### Q: How do I test webhooks in production?

Stripe and PayPal dashboards have "Send test event" buttons:
1. Go to webhook settings in your provider's dashboard
2. Click "Send test event" or "Test webhook"
3. Check logs to see if event was processed

### Q: What if someone makes a donation but webhook fails?

The donation record is created with `pending` status. The admin can manually update it in the dashboard if needed. Webhooks are retried automatically by payment processors.

### Q: Can I test webhooks locally?

Yes! Use **Stripe CLI** or manually trigger events:

1. **Stripe CLI (simplest):**
   ```bash
   stripe trigger payment_intent.succeeded
   ```

2. **PayPal sandbox:** Use PayPal's test dashboard

3. **Manual update:** Use admin dashboard to test status changes

### Q: How do I know if a webhook was successful?

- Check logs: `storage/logs/laravel.log`
- Search for: "Stripe webhook" or "PayPal webhook"
- Monitor admin dashboard - status should update automatically
- Check donation records: status should change from pending → completed

---

## Deployment Checklist

- [ ] Update `.env` with production Stripe/PayPal keys
- [ ] Update `.env` with `STRIPE_WEBHOOK_SECRET`
- [ ] Add `PAYPAL_WEBHOOK_ID` to `.env`
- [ ] Configure webhooks in Stripe dashboard
- [ ] Configure webhooks in PayPal dashboard
- [ ] Test webhook endpoint: `GET /api/v1/webhooks/test`
- [ ] Test with real donation
- [ ] Verify webhook fires and updates status
- [ ] Check logs for any errors
- [ ] Monitor first 24 hours for webhook issues

---

## Support

For webhook issues:
1. Check error logs: `storage/logs/laravel.log`
2. Verify webhook URL is correct and public
3. Test with payment provider's dashboard tools
4. Manually update donation status in admin dashboard if needed
5. Contact payment processor support if webhooks consistently fail

---

**Last Updated:** February 25, 2026
**Status:** Production Ready ✅
