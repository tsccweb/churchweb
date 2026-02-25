# Testing Webhooks - Step by Step

## Quick Test

**Verify webhook endpoint is active:**
```bash
GET http://localhost:8000/api/v1/webhooks/test
```

Expected response (200 OK):
```json
{
  "status": "success",
  "message": "Webhook endpoint is active and accessible",
  "timestamp": "2026-02-25T04:47:51.636727Z"
}
```

---

## Testing Stripe Webhooks

### Method 1: Using Stripe CLI (Recommended)

**Installation:**
1. Download from https://stripe.com/docs/stripe-cli
2. Extract and add to PATH

**Test locally:**
```bash
# Terminal 1: Listen for and forward Stripe events
stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe

# You'll see output like:
# > Ready! Your webhook signing secret is whsec_test_xxxxx

# Copy the signing secret and update STRIPE_WEBHOOK_SECRET in .env
```

```bash
# Terminal 2: Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded

# Watch Terminal 1 for webhook processing
```

### Method 2: Manual curl Test

```bash
# Create a test payment intent event
curl -X POST http://localhost:8000/api/v1/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "amount": 5000,
        "metadata": {
          "donor_email": "test@example.com",
          "donor_name": "Test Donor"
        }
      }
    }
  }'
```

**Note:** This won't verify the signature, so it's just for endpoint testing.

---

## Testing PayPal Webhooks

### Method 1: PayPal Sandbox Dashboard

1. Go to https://developer.paypal.com
2. Log in and navigate to **Webhooks**
3. Select your webhook
4. Click **Send a Test Webhook**
5. Choose an event type
6. Click **Send Test Event**

Your webhook handler will receive and process the test event.

### Method 2: Manual curl Test

```bash
# Simulate PayPal webhook
curl -X POST http://localhost:8000/api/v1/webhooks/paypal \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "PAYMENT.SALE.COMPLETED",
    "resource": {
      "amount": "50.00",
      "payer": {
        "email": "donor@example.com"
      }
    }
  }'
```

---

## Integration Test: Full Donation Flow

### Test Scenario: Card Donation with Webhook

1. **Create test donation (publicly):**
   ```bash
   curl -X POST http://localhost:8000/api/v1/donations \
     -H "Content-Type: application/json" \
     -d '{
       "donor_name": "Test Donor",
       "donor_email": "test@example.com",
       "amount": 50,
       "currency": "USD",
       "payment_method": "stripe",
       "status": "pending"
     }'
   ```

   Expected response (201 Created):
   ```json
   {
     "id": "uuid-xxx",
     "donor_name": "Test Donor",
     "donor_email": "test@example.com",
     "amount": "50.00",
     "status": "pending",
     "payment_method": "stripe"
   }
   ```

2. **Simulate Stripe webhook (mark as completed):**
   ```bash
   curl -X POST http://localhost:8000/api/v1/webhooks/stripe \
     -H "Content-Type: application/json" \
     -d '{
       "type": "payment_intent.succeeded",
       "data": {
         "object": {
           "amount": 5000,
           "metadata": {
             "donor_email": "test@example.com",
             "donor_name": "Test Donor"
           }
         }
       }
     }'
   ```

3. **Check donation status (admin only):**
   ```bash
   # Requires authentication
   curl -X GET "http://localhost:8000/api/v1/admin/donations" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

   You should see the donation with `status: "completed"`

4. **View in admin dashboard:**
   - Log in to http://localhost:5173/admin
   - Go to Donations
   - See the donation with green "completed" badge

---

## Debugging Webhooks

### Check Logs

```bash
# View all webhook logs
grep -i "webhook" storage/logs/laravel.log

# View Stripe webhook events
grep "Stripe webhook" storage/logs/laravel.log

# View PayPal webhook events
grep "PayPal webhook" storage/logs/laravel.log

# Real-time log monitoring
tail -f storage/logs/laravel.log | grep -i webhook
```

### Common Issues

**Issue: "Invalid signature"**
- Error: `403 Forbidden - Invalid signature`
- Cause: `STRIPE_WEBHOOK_SECRET` is wrong or missing
- Fix: Copy signing secret from `stripe listen` output

**Issue: "Donation not found"**
- Warning logged but webhook still succeeds (200 OK)
- Cause: No matching donation record with that email/amount
- Fix: Ensure donation was created before webhook fires

**Issue: "Webhook endpoint not found"**
- Error: `404 Not Found`
- Cause: Routes not cached or URL incorrect
- Fix: Run `php artisan route:clear`

**Issue: "No response from webhook"**
- Stripe/PayPal shows "Webhook Request Failed"
- Cause: Firewall blocking access or endpoint timing out
- Fix: Check firewall, verify Laravel is running, check logs

---

## Test Cases

### ✅ Test 1: Payment Success
```
Donation created (pending)
  → Simulate payment_intent.succeeded webhook
  → Expect: Status changes to "completed"
  → Verify in admin dashboard
```

### ✅ Test 2: Payment Failed
```
Donation created (pending)
  → Simulate payment_intent.payment_failed webhook
  → Expect: Status changes to "failed"
  → Verify in admin dashboard
```

### ✅ Test 3: Payment Refunded
```
Donation created → completed
  → Simulate charge.refunded webhook
  → Expect: Status changes to "failed"
  → Verify in admin dashboard
```

### ✅ Test 4: Multiple Donations
```
Create multiple donations with different amounts
  → Simulate webhooks for each
  → Verify each updates correctly
  → Check admin dashboard shows all accurately
```

### ✅ Test 5: PayPal Donation
```
Donation created (PayPal, pending)
  → Simulate PAYMENT.SALE.COMPLETED webhook
  → Expect: Status changes to "completed"
  → Verify in admin dashboard
```

---

## Production Testing

Before deploying to production:

1. **Configure real webhooks** (see WEBHOOK_SETUP.md)
2. **Test with test keys first** (Stripe/PayPal sandbox)
3. **Make a test donation** end-to-end
4. **Verify webhook fires** (check logs)
5. **Confirm status updates** in admin dashboard
6. **Switch to production keys** when confident
7. **Monitor first 24 hours** for any webhook failures

---

## Webhook Logs Location

All webhook events are logged in:
```
storage/logs/laravel.log
```

Log entries look like:
```
[2026-02-25 04:47:51] local.INFO: Stripe webhook: Payment succeeded for donation a12345...
[2026-02-25 04:48:12] local.INFO: PayPal webhook: Sale completed for donation b67890...
[2026-02-25 04:49:33] local.WARNING: Stripe webhook: Payment failed for donation c11111...
```

---

## Quick Reference

| Event | Status Change | Test Command |
|-------|--------------|--------------|
| Stripe Succeeded | pending → completed | `stripe trigger payment_intent.succeeded` |
| Stripe Failed | pending → failed | `stripe trigger payment_intent.payment_failed` |
| Stripe Refund | completed → failed | `stripe trigger charge.refunded` |
| PayPal Completed | pending → completed | PayPal Dashboard: Send Test Webhook |
| PayPal Denied | pending → failed | PayPal Dashboard: Send Test Webhook |

---

**Last Updated:** February 25, 2026
**Status:** Testing Ready ✅
