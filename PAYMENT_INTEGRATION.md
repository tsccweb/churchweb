# Multi-Payment Integration Guide

## Overview

The Resurrection church website now supports three payment methods for donations:
1. **Card (Stripe)** - Credit/Debit card via Stripe
2. **PayPal** - PayPal checkout flow
3. **GCash** - Manual payment instructions for Philippine users

## Architecture

### Frontend (React/Vite)
- **Location**: `tscc/src/pages/public/Donate.jsx`
- **Components**:
  - `Donate.jsx` - Main donation page with payment method selector
  - `StripePaymentForm.jsx` - Stripe card payment component
  - Reusable UI components: `Button`, `Card`, `CardBody`

### Backend (Laravel)
- **Controller**: `app/Http/Controllers/Api/DonationController.php`
- **Routes**: `routes/api.php` - REST endpoints for payment processing
- **Model**: `app/Models/Donation.php` - Donation database model
- **Config**: `config/services.php` - Third-party service credentials

### Database
- **Table**: `donations`
- **Columns**: 
  - `id` (UUID)
  - `donor_name` (string)
  - `donor_email` (email)
  - `amount` (decimal)
  - `currency` (string)
  - `payment_method` (enum: stripe, paypal, gcash)
  - `status` (enum: pending, completed, failed)
  - `timestamps`

## Payment Flows

### 1. Card Payment (Stripe)
```
User selects Card → Fills donor info & amount 
  → Clicks "Continue to Payment"
  → StripePaymentForm displays CardElement
  → POST /donations/payment-intent (create PaymentIntent)
  → Display card input field
  → User enters card details
  → stripe.confirmCardPayment() processes payment
  → POST /donations (create donation record)
  → Show success message
```

**API Endpoints:**
- `POST /api/v1/donations/payment-intent` - Creates Stripe PaymentIntent
  - Request: `{ amount, donor_name, donor_email }`
  - Response: `{ client_secret, amount, test_mode }`
- `POST /api/v1/donations` - Creates donation record
  - Request: `{ donor_name, donor_email, amount, currency, payment_method }`
  - Response: Created donation object

### 2. PayPal Payment
```
User selects PayPal → Fills donor info & amount
  → Clicks "Continue to PayPal"
  → POST /donations/paypal-checkout
  → Creates donation record (status: pending)
  → Returns redirect_url to PayPal checkout
  → Browser redirects to PayPal
  → User completes payment on PayPal
  → PayPal redirects to return_url (/api/v1/donations/paypal-return)
  → Updates donation status to completed
  → Shows success message
```

**API Endpoints:**
- `POST /api/v1/donations/paypal-checkout` - Initiates PayPal checkout
  - Request: `{ donor_name, donor_email, amount, return_url, cancel_url }`
  - Response: `{ redirect_url, donation_id, message }`
  - Test Mode: Returns mock redirect URL for testing
- `GET /api/v1/donations/paypal-return` - PayPal return callback
  - Query Params: `donation_id`, `test`
  - Response: `{ success, message, donation }`

### 3. GCash Payment
```
User selects GCash → Fills donor info & amount
  → Clicks "Continue to GCash"
  → POST /donations with payment_method='gcash'
  → Creates donation record (status: pending)
  → Show GCash payment instructions (manual process)
  → User sends GCash from their phone
  → User emails proof of payment
  → Admin verifies and updates donation status
```

**API Endpoints:**
- `POST /api/v1/donations` - Creates donation record with payment_method=gcash
  - Request: `{ donor_name, donor_email, amount, currency, payment_method }`
  - Response: Created donation object with ID

## Configuration

### Environment Variables

#### Backend (.env)
```env
# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxx

# PayPal Configuration
PAYPAL_CLIENT_ID=sandbox_client_id
PAYPAL_SECRET=sandbox_secret
PAYPAL_MODE=sandbox
```

#### Frontend (tscc/.env)
```env
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
```

### Services Configuration
File: `config/services.php`
```php
'stripe' => [
    'public' => env('STRIPE_PUBLIC_KEY'),
    'secret' => env('STRIPE_SECRET_KEY'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
],
'paypal' => [
    'client_id' => env('PAYPAL_CLIENT_ID'),
    'secret' => env('PAYPAL_SECRET'),
    'mode' => env('PAYPAL_MODE', 'sandbox'),
],
```

## installation & Setup

### Prerequisites
- Node.js 18+ (Frontend)
- PHP 8.2+ (Backend)
- PostgreSQL 13+ (Database)
- Stripe Account (for card payments)
- PayPal Account (for PayPal payments)

### Step 1: Install Dependencies

**Backend:**
```bash
cd resurrection
composer install
```

**Frontend:**
```bash
cd tscc
npm install
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Step 2: Get API Keys

#### Stripe Keys
1. Go to https://dashboard.stripe.com
2. Go to Developers → API Keys
3. Copy `Publishable key` (for STRIPE_PUBLIC_KEY)
4. Copy `Secret key` (for STRIPE_SECRET_KEY)
5. Get Webhook Signing Secret from Webhooks section

#### PayPal Keys (for production)
1. Go to https://developer.paypal.com
2. Create or use existing app
3. Copy Client ID (for PAYPAL_CLIENT_ID)
4. Copy Secret (for PAYPAL_SECRET)

### Step 3: Configure Environment Variables

```bash
# Backend
cp .env.example .env
# Edit .env and add your Stripe & PayPal keys

# Frontend
cd tscc
cp .env .env.local  # Create .env if doesn't exist
# Edit and add VITE_STRIPE_PUBLIC_KEY
```

### Step 4: Database Setup

```bash
cd resurrection
php artisan migrate
php artisan db:seed
```

### Step 5: Run Development Servers

**Backend (Laravel):**
```bash
cd resurrection
php artisan serve
# Runs on http://localhost:8000
```

**Frontend (Vite):**
```bash
cd tscc
npm run dev
# Runs on http://localhost:5173
```

## Testing

### Test Mode Features
- Stripe test keys return mock PaymentIntent responses
- PayPal returns mock redirect URLs (doesn't actually process)
- GCash is fully manual (no integration required)

### Test Cards (only with real Stripe keys)
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Auth Required**: 4000 0025 0000 3155

### Test PayPal
1. Use sandbox credentials from PayPal Developer
2. Create sandbox buyer/seller accounts
3. Test transactions in sandbox environment

## Donation Statistics

**Endpoint**: `GET /api/v1/donations/stats`
- Public endpoint for displaying donation stats on homepage
- Returns: `{ total_donated, donation_count }`

**Admin Endpoints:**
- `GET /api/v1/admin/donations` - List all donations (paginated)
- `GET /api/v1/admin/donations/{id}` - Get single donation
- `GET /api/v1/admin/donations/export` - Export donations as CSV

## What's Next

### PRIORITY 1: Production Deployment
- [ ] Get real Stripe production keys
- [ ] Get real PayPal production credentials
- [ ] Update environment variables on production server
- [ ] Test with real payments in production

### PRIORITY 2: Webhooks & Automation
- [ ] Set up Stripe webhook handler for payment confirmation
- [ ] Set up PayPal webhook handler for payment confirmation
- [ ] Auto-update donation status to "completed" on successful payment
- [ ] Send confirmation emails to donors

### PRIORITY 3: Enhanced Features
- [ ] Admin dashboard for managing donations
- [ ] Recurring/subscription donations (Stripe Subscriptions)
- [ ] Tax receipt generation
- [ ] Donation thank you email templates
- [ ] GCash manual verification admin interface
- [ ] Donation refund handling

### PRIORITY 4: Compliance & Security
- [ ] PCI DSS compliance (avoid storing card data)
- [ ] GDPR compliance for EU donors
- [ ] Financial reporting & audit trails
- [ ] Fraud detection setup

## Troubleshooting

### "Route [donations.paypal-return] not defined"
- Solution: Ensure route is defined in `routes/api.php`
- Check: `Route::get('/donations/paypal-return', ...)->name('donations.paypal-return');`

### Stripe CardElement not showing
- Check VITE_STRIPE_PUBLIC_KEY is set in frontend .env
- Verify Elements provider wraps the StripePaymentForm
- Check browser console for Stripe JS load errors

### PayPal redirects not working
- Ensure return_url and cancel_url are valid URLs
- Test with http://localhost:5173/donate for development
- In production, use https URLs

### Database errors
- Run migrations: `php artisan migrate`
- Check database connection in .env
- Verify PostgreSQL is running

## API Response Examples

### Payment Intent Response
```json
{
  "client_secret": "pi_test_xxx_secret_xxx",
  "amount": 100,
  "test_mode": true,
  "note": "Using test Stripe keys..."
}
```

### PayPal Checkout Response
```json
{
  "redirect_url": "http://localhost:8000/api/v1/donations/paypal-return?donation_id=xxx&test=1",
  "donation_id": "xxx",
  "message": "Test mode: Redirecting to mock PayPal payment"
}
```

### Donation Record
```json
{
  "id": "a1297127-e64b-4d56-9df0-615b13b72344",
  "donor_name": "John Doe",
  "donor_email": "john@example.com",
  "amount": "100.00",
  "currency": "USD",
  "payment_method": "stripe",
  "status": "pending",
  "created_at": "2026-02-25T04:01:38.000000Z",
  "updated_at": "2026-02-25T04:01:38.000000Z"
}
```

## File Reference

### Frontend
- `tscc/src/pages/public/Donate.jsx` - Main donation page
- `tscc/src/components/StripePaymentForm.jsx` - Card payment form
- `tscc/src/services/api.js` - API client
- `tscc/.env` - Frontend env vars

### Backend
- `app/Http/Controllers/Api/DonationController.php` - Payment endpoints
- `app/Models/Donation.php` - Donation model
- `config/services.php` - Service credentials
- `routes/api.php` - API routes
- `.env` - Backend env vars

### Database
- `database/migrations/2026_02_25_010104_create_donations_table.php`

## Support

For issues or questions:
1. Check this documentation
2. Review the API response errors
3. Check Laravel logs: `storage/logs/laravel.log`
4. Check frontend console (F12) for JavaScript errors
5. Contact support at tsccresurrection@gmail.com

---

**Last Updated**: 2026-02-25
**Status**: Multi-payment integration complete & tested
**Next**: Production deployment & webhook setup
