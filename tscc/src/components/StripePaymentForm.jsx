import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/shared';
import API from '@/services/api';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      backgroundColor: 'transparent',
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#9ca3af',
      },
    },
    invalid: {
      color: '#dc2626',
    },
  },
};

export default function StripePaymentForm({
  amount,
  donorName,
  donorEmail,
  frequency,
  onSuccess,
  onError,
  loading,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Create payment intent on backend
      const intentResponse = await API.post('/donations/payment-intent', {
        amount: parseFloat(amount),
        donor_name: donorName,
        donor_email: donorEmail,
      });

      const { client_secret, test_mode } = intentResponse;

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: donorName,
            email: donorEmail,
          },
        },
      });

      if (error) {
        onError(error.message);
      } else if (paymentIntent.status === 'succeeded' || test_mode) {
        // Step 3: Create donation record on backend
        // Include payment intent ID for webhook matching
        const donationResponse = await API.post('/donations', {
          donor_name: donorName,
          donor_email: donorEmail,
          amount: parseFloat(amount),
          currency: 'USD',
          payment_method: 'stripe',
          // In production, webhook will update status automatically
          // In test mode, mark as pending (webhook won't fire)
          status: test_mode ? 'pending' : 'pending', // Webhook will update to completed
        });

        onSuccess(donationResponse);
      }
    } catch (err) {
      onError(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 'var(--spacing-lg)' }}>
      <div
        style={{
          border: '1px solid var(--color-border)',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-lg)',
          backgroundColor: 'var(--color-background)',
        }}
      >
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={!stripe || processing || loading}
        style={{ width: '100%' }}
      >
        {processing ? 'Processing Payment...' : `Pay $${amount}`}
      </Button>
    </form>
  );
}
