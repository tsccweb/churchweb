import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody } from '@/components/shared';
import { Link, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '@/components/StripePaymentForm';
import API from '@/services/api';

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51234567890abcdefghijklmnopqrstuvwxyz'
);

export default function Donate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState('one-time');
  const [paymentMethod, setPaymentMethod] = useState('card'); // card, paypal, gcash
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPayPalPopup, setShowPayPalPopup] = useState(false);
  const [paypalCountdown, setPaypalCountdown] = useState(4);
  const [paypalDonationAmount, setPaypalDonationAmount] = useState(null);
  const [showGCashPopup, setShowGCashPopup] = useState(false);
  const [gcashCountdown, setGcashCountdown] = useState(4);
  const [gcashDonationAmount, setGcashDonationAmount] = useState(null);
  const [gcashCopied, setGcashCopied] = useState(false);
  const [showGCashQR, setShowGCashQR] = useState(false);

  // Check for success/cancel params from PayPal redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      const amount = searchParams.get('amount');
      setSuccessMessage(`✓ Thank you! Your donation of $${amount} has been received. A confirmation email will be sent shortly.`);
      setSubmitted(true);
      // Clear URL params
      setSearchParams({});
      setTimeout(() => setSubmitted(false), 6000);
    } else if (searchParams.get('cancelled') === 'true') {
      setError('Payment was cancelled. Please try again if you wish to continue.');
      setSearchParams({});
      setTimeout(() => setError(''), 5000);
    }
  }, [searchParams, setSearchParams]);

  // Countdown timer for PayPal popup
  useEffect(() => {
    if (showPayPalPopup && paypalCountdown > 0) {
      const timer = setTimeout(() => {
        setPaypalCountdown(paypalCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showPayPalPopup, paypalCountdown]);

  // Countdown timer for GCash popup
  useEffect(() => {
    if (showGCashPopup && gcashCountdown > 0) {
      const timer = setTimeout(() => {
        setGcashCountdown(gcashCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showGCashPopup, gcashCountdown]);

  const presetAmounts = [
    { value: 10, label: '$10' },
    { value: 25, label: '$25' },
    { value: 50, label: '$50' },
    { value: 100, label: '$100' },
    { value: 250, label: '$250' },
  ];

  const handleContinue = async (e) => {
    e?.preventDefault?.();
    const amount = selectedAmount || customAmount;

    if (!amount) {
      setError('Please select or enter an amount');
      return;
    }
    if (!donorName || !donorEmail) {
      setError('Please enter your name and email');
      return;
    }

    setError('');

    if (paymentMethod === 'card') {
      // Show Stripe payment form
      setShowPaymentForm(true);
    } else if (paymentMethod === 'paypal') {
      // Redirect to PayPal
      handlePayPalPayment(amount, donorName, donorEmail);
    } else if (paymentMethod === 'gcash') {
      // Show GCash instructions
      handleGCashPayment(amount, donorName, donorEmail);
    }
  };

  const handlePayPalPayment = async (amount, name, email) => {
    setLoading(true);
    try {
      // Create donation record
      const response = await API.post('/donations/paypal-checkout', {
        donor_name: name,
        donor_email: email,
        amount: parseFloat(amount),
      });

      // Show PayPal popup with instructions
      if (response.success) {
        setPaypalDonationAmount(amount);
        setPaypalCountdown(4);
        setShowPayPalPopup(true);
        setShowPaymentForm(false);
      }
    } catch (err) {
      setError('Failed to process donation. Please try again.');
      console.error('PayPal error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGCashPayment = async (amount, name, email) => {
    setLoading(true);
    try {
      // Create donation record with GCash method
      const response = await API.post('/donations', {
        donor_name: name,
        donor_email: email,
        amount: parseFloat(amount),
        currency: 'USD',
        payment_method: 'gcash',
      });

      // Show GCash popup with instructions
      if (response) {
        setGcashDonationAmount(amount);
        setGcashCountdown(4);
        setShowGCashPopup(true);
        setShowPaymentForm(false);
      }
    } catch (err) {
      setError('Failed to create donation. Please try again.');
      console.error('GCash error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setSubmitted(true);
    setShowPaymentForm(false);
    setDonorName('');
    setDonorEmail('');
    setSelectedAmount(null);
    setCustomAmount('');

    setTimeout(() => setSubmitted(false), 5000);
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <div className="donate-page">
      {/* Hero Section */}
      <section className="hero-section" style={{ minHeight: '35vh' }}>
        <div className="hero-content">
          <h1 className="hero-title">Make a Difference</h1>
          <p className="hero-subtitle">Support Our Ministry & Community Impact</p>
        </div>
        <div className="hero-overlay"></div>
      </section>

      {/* PayPal Payment Instructions Popup */}
      {showPayPalPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-2xl)',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            {/* Popup Header */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ fontSize: '40px', marginBottom: 'var(--spacing-md)' }}>🅿️</div>
              <h2 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', color: '#1f2937' }}>PayPal Payment Instructions</h2>
              <p style={{ color: '#374151', margin: 0, fontSize: '0.95rem' }}>Donation Amount: <strong style={{ color: '#1f2937' }}>${parseFloat(paypalDonationAmount).toFixed(2)}</strong></p>
            </div>

            {/* Instructions Box */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #3b82f6',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <p style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.95rem', color: '#1e40af' }}>
                Please send your donation to our PayPal account:
              </p>
              <div style={{
                backgroundColor: '#f3f4f6',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'monospace',
                textAlign: 'center',
                fontWeight: '600',
                marginBottom: 'var(--spacing-md)',
                border: '1px solid #d1d5db',
                color: '#1f2937',
                fontSize: '1rem'
              }}>
                jasonanthonytrillo@gmail.com
              </div>
              <p style={{ fontSize: '0.9rem', margin: 0, color: '#374151' }}>
                Once payment is received, our team will review and confirm your donation. Thank you for your generosity!
              </p>
            </div>

            {/* Countdown Timer */}
            <div style={{
              textAlign: 'center',
              marginBottom: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)',
              backgroundColor: '#fef3c7',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #fcd34d'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#78350f', fontWeight: '600' }}>
                You can close this in <strong>{paypalCountdown}</strong> second{paypalCountdown !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowPayPalPopup(false)}
              disabled={paypalCountdown > 0}
              style={{
                width: '100%',
                padding: 'var(--spacing-md)',
                backgroundColor: paypalCountdown > 0 ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
                cursor: paypalCountdown > 0 ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (paypalCountdown === 0) {
                  e.target.style.backgroundColor = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (paypalCountdown === 0) {
                  e.target.style.backgroundColor = '#3b82f6';
                }
              }}
            >
              {paypalCountdown > 0 ? `Close (${paypalCountdown}s)` : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* GCash Payment Instructions Popup */}
      {showGCashPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-2xl)',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            {/* Close Button (X) */}
            <button
              onClick={() => setShowGCashPopup(false)}
              style={{
                position: 'absolute',
                top: 'var(--spacing-md)',
                right: 'var(--spacing-md)',
                backgroundColor: '#f3f4f6',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1f2937',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              title="Close"
            >
              ✕
            </button>
            {/* Popup Header */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ fontSize: '40px', marginBottom: 'var(--spacing-md)' }}>💳</div>
              <h2 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', color: '#1f2937' }}>GCash Payment Instructions</h2>
              <p style={{ color: '#374151', margin: 0, fontSize: '0.95rem' }}>Donation Amount: <strong style={{ color: '#1f2937' }}>₱{(parseFloat(gcashDonationAmount) * 55).toFixed(2)}</strong></p>
            </div>

            {/* Instructions Box */}
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #4ade80',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <p style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.95rem', color: '#166534' }}>
                Send your donation to this GCash number:
              </p>
              {/* Show QR Code Button */}
              <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>
                <button
                  onClick={() => setShowGCashQR(!showGCashQR)}
                  style={{
                    backgroundColor: '#d1fae5',
                    border: '2px solid #4ade80',
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    color: '#166534',
                    transition: 'all 0.2s',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#a7f3d0';
                    e.target.style.borderColor = '#22c55e';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#d1fae5';
                    e.target.style.borderColor = '#4ade80';
                  }}
                >
                  {showGCashQR ? '✓ Hide QR Code' : '📱 Scan QR Code Here'}
                </button>
              </div>
              {/* QR Code Display */}
              {showGCashQR && (
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>
                  <img 
                    src="/gcash-qr.png" 
                    alt="GCash QR Code" 
                    style={{
                      maxWidth: '220px',
                      height: 'auto',
                      borderRadius: 'var(--radius-sm)',
                      border: '2px solid #4ade80'
                    }}
                  />
                </div>
              )}
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{
                  display: 'flex',
                  gap: 'var(--spacing-sm)',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    backgroundColor: '#f3f4f6',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'monospace',
                    fontWeight: '600',
                    border: '1px solid #d1d5db',
                    color: '#1f2937',
                    fontSize: '1.1rem',
                    flex: 1
                  }}>
                    09919357954
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('09919357954');
                      setGcashCopied(true);
                      setTimeout(() => {
                        setGcashCopied(false);
                        setShowGCashPopup(false);
                      }, 2000);
                    }}
                    style={{
                      backgroundColor: '#22c55e',
                      color: 'white',
                      border: 'none',
                      padding: 'var(--spacing-md) var(--spacing-lg)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'background-color 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#16a34a'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#22c55e'}
                  >
                    {gcashCopied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', margin: 0, color: '#374151' }}>
                Once we receive your payment, our team will review and confirm your donation. Thank you for your generosity!
              </p>
            </div>

            {/* Countdown Timer */}
            <div style={{
              textAlign: 'center',
              marginBottom: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)',
              backgroundColor: '#fef3c7',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #fcd34d'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#78350f', fontWeight: '600' }}>
                You can close this in <strong>{gcashCountdown}</strong> second{gcashCountdown !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowGCashPopup(false)}
              disabled={gcashCountdown > 0}
              style={{
                width: '100%',
                padding: 'var(--spacing-md)',
                backgroundColor: gcashCountdown > 0 ? '#9ca3af' : '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
                cursor: gcashCountdown > 0 ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (gcashCountdown === 0) {
                  e.target.style.backgroundColor = '#16a34a';
                }
              }}
              onMouseLeave={(e) => {
                if (gcashCountdown === 0) {
                  e.target.style.backgroundColor = '#22c55e';
                }
              }}
            >
              {gcashCountdown > 0 ? `Close (${gcashCountdown}s)` : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container" style={{ paddingTop: 'var(--spacing-3xl)', paddingBottom: 'var(--spacing-3xl)' }}>
        <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-3xl)', alignItems: 'start' }}>
          {/* Left Column - Why Donate */}
          <div>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Why Your Gift Matters</h2>
            <p style={{ marginBottom: 'var(--spacing-md)', lineHeight: '1.8' }}>
              Every dollar donated to The Shepherds Community Centre directly impacts the lives of people in our community. 
              Your generosity enables us to continue our vital ministries and extend Christ's love to those in need.
            </p>

            <h3 style={{ marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-md)' }}>What Your Donation Supports</h3>
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-xs)' }}>🎓 Spiritual Teaching</h4>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Supporting quality ministry programs and biblical education for all ages.</p>
              </div>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-xs)' }}>🤝 Community Outreach</h4>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Funding community service projects, food assistance, and support for those in crisis.</p>
              </div>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-xs)' }}>🏢 Facility & Operations</h4>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Maintaining our welcoming space where worship, fellowship, and community happen.</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-xs)' }}>👥 Pastoral Care</h4>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>Enabling our team to provide counseling, prayer support, and compassionate care.</p>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--color-background-secondary)',
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--radius-lg)',
              marginTop: 'var(--spacing-xl)',
              borderLeft: '4px solid var(--color-primary)'
            }}>
              <h4 style={{ marginBottom: 'var(--spacing-md)' }}>💡 Your Impact</h4>
              <ul style={{ listStyle: 'none', color: 'var(--color-text-secondary)' }}>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}>✓ $10 = Prayer journals & Bible study materials for one person</li>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}>✓ $25 = Provisions for a family in need</li>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}>✓ $50 = Tech equipment for online ministry programs</li>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}>✓ $100 = Pastoral counseling & support services</li>
                <li>✓ $250+ = Significant impact on community outreach initiatives</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Donation Form */}
          <div>
            <Card style={{ position: 'sticky', top: 'var(--spacing-lg)' }}>
              <CardBody>
                <h3 style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>Make Your Donation</h3>

                {submitted && (
                  <div style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    color: '#22c55e',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-lg)'
                  }}>
                    ✓ {successMessage || 'Thank you for your generous donation!'}
                  </div>
                )}

                {submitted && paymentMethod === 'paypal' && (
                  <div style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid #3b82f6',
                    color: '#1e40af',
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-lg)'
                  }}>
                    <h4 style={{ marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>PayPal Payment Instructions</h4>
                    <p style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.95rem' }}>
                      Please send your donation to our PayPal account:
                    </p>
                    <div style={{
                      backgroundColor: '#e0e7ff',
                      padding: 'var(--spacing-md)',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: 'var(--spacing-md)',
                      fontFamily: 'monospace'
                    }}>
                      <strong>PayPal Email:</strong> donations@example.com
                    </div>
                    <p style={{ fontSize: '0.9rem' }}>
                      Once payment is received, our team will review and confirm your donation. Thank you for your generosity!
                    </p>
                  </div>
                )}

                {error && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-lg)'
                  }}>
                    ✕ {error}
                  </div>
                )}

                {/* Donor Name */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-md)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                {/* Donor Email */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-md)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                {/* Frequency Selection */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-md)', fontWeight: '600' }}>
                    Donation Type
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <label style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <input
                        type="radio"
                        value="one-time"
                        checked={frequency === 'one-time'}
                        onChange={(e) => setFrequency(e.target.value)}
                        style={{ marginRight: 'var(--spacing-sm)', cursor: 'pointer' }}
                      />
                      One-Time
                    </label>
                    <label style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <input
                        type="radio"
                        value="monthly"
                        checked={frequency === 'monthly'}
                        onChange={(e) => setFrequency(e.target.value)}
                        style={{ marginRight: 'var(--spacing-sm)', cursor: 'pointer' }}
                      />
                      Monthly
                    </label>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-md)', fontWeight: '600' }}>
                    Payment Method
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-sm)' }}>
                    {[
                      { id: 'card', label: '💳 Card (Stripe)', icon: '💳' },
                      { id: 'paypal', label: '🅿️ PayPal', icon: '🅿️' },
                      { id: 'gcash', label: '📱 GCash', icon: '📱' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => {
                          setPaymentMethod(method.id);
                          setError('');
                        }}
                        style={{
                          padding: 'var(--spacing-md)',
                          border: '2px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: paymentMethod === method.id ? 'var(--color-primary)' : 'transparent',
                          color: paymentMethod === method.id ? 'white' : 'var(--color-text)',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          fontSize: '0.95rem'
                        }}
                        onMouseOver={(e) => {
                          if (paymentMethod !== method.id) {
                            e.target.style.borderColor = 'var(--color-primary)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (paymentMethod !== method.id) {
                            e.target.style.borderColor = 'var(--color-border)';
                          }
                        }}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Selection */}
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-md)', fontWeight: '600' }}>
                    Select Amount
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                    {presetAmounts.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => {
                          setSelectedAmount(preset.value);
                          setCustomAmount('');
                        }}
                        style={{
                          padding: 'var(--spacing-md)',
                          border: '2px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: selectedAmount === preset.value ? 'var(--color-primary)' : 'transparent',
                          color: selectedAmount === preset.value ? 'white' : 'var(--color-text)',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.3s ease',
                          fontSize: '0.95rem'
                        }}
                        onMouseOver={(e) => {
                          if (selectedAmount !== preset.value) {
                            e.target.style.borderColor = 'var(--color-primary)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (selectedAmount !== preset.value) {
                            e.target.style.borderColor = 'var(--color-border)';
                          }
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: 'var(--spacing-xs)' }}>
                      Other Amount
                    </label>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                      <span style={{ padding: 'var(--spacing-sm) var(--spacing-md)', backgroundColor: 'var(--color-background-secondary)', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)' }}>
                        $
                      </span>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setSelectedAmount(null);
                        }}
                        style={{
                          flex: 1,
                          padding: 'var(--spacing-sm) var(--spacing-md)',
                          border: '2px solid var(--color-border)',
                          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Form Section - Different based on payment method */}
                {showPaymentForm ? (
                  <>
                    {paymentMethod === 'card' && (
                      <Elements stripe={stripePromise}>
                        <StripePaymentForm
                          amount={selectedAmount || customAmount}
                          donorName={donorName}
                          donorEmail={donorEmail}
                          frequency={frequency}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          loading={loading}
                        />
                      </Elements>
                    )}

                    {paymentMethod === 'paypal' && (
                      <div style={{
                        padding: 'var(--spacing-lg)',
                        backgroundColor: 'var(--color-background-secondary)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-lg)',
                        textAlign: 'center'
                      }}>
                        <p style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                          You will be redirected to PayPal to complete your donation of ${selectedAmount || customAmount}
                        </p>
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={() => handlePayPalPayment(selectedAmount || customAmount, donorName, donorEmail)}
                          disabled={loading}
                          style={{ width: '100%' }}
                        >
                          {loading ? 'Redirecting to PayPal...' : 'Continue to PayPal'}
                        </Button>
                      </div>
                    )}

                    {paymentMethod === 'gcash' && (
                      <div style={{
                        padding: 'var(--spacing-lg)',
                        backgroundColor: 'var(--color-background-secondary)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-lg)'
                      }}>
                        <h4 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-primary)' }}>📱 GCash Payment Instructions</h4>
                        <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                          <p style={{ marginBottom: 'var(--spacing-md)' }}>
                            Thank you for choosing GCash! Here's how to send your donation:
                          </p>
                          <ol style={{ marginBottom: 'var(--spacing-lg)', paddingLeft: '20px' }}>
                            <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                              Open your GCash app
                            </li>
                            <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                              Send to: <strong>0918-123-4567</strong> (TSCC Ministry Phone)
                            </li>
                            <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                              Amount: <strong>${selectedAmount || customAmount}</strong>
                            </li>
                            <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                              In the message field, write: <strong>{donorName}</strong>
                            </li>
                            <li>
                              Send and take a screenshot as proof of payment
                            </li>
                          </ol>
                          <p style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.95rem' }}>
                            ✓ <strong>Payment recorded!</strong> We've created a donation record for you ({donorEmail})
                          </p>
                          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                            After sending, please reply to confirm payment at: <strong>tsccresurrection@gmail.com</strong>
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => setShowPaymentForm(false)}
                          style={{ width: '100%', marginTop: 'var(--spacing-lg)' }}
                        >
                          Back
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleContinue}
                    disabled={loading}
                    style={{ width: '100%', marginBottom: 'var(--spacing-lg)' }}
                  >
                    {loading ? 'Processing...' : `Continue to ${paymentMethod === 'card' ? 'Payment' : paymentMethod === 'paypal' ? 'PayPal' : 'GCash'}`}
                  </Button>
                )}

                {/* Security Note */}
                <div style={{
                  textAlign: 'center',
                  paddingTop: 'var(--spacing-lg)',
                  borderTop: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9rem'
                }}>
                  <p style={{ marginBottom: 'var(--spacing-sm)' }}>🔒 Secure Payment Processing</p>
                  <p>All donations are processed securely via Stripe. We never store your card details.</p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <section style={{ marginTop: 'var(--spacing-3xl)', maxWidth: '900px', margin: 'var(--spacing-3xl) auto 0' }}>
          <h2 style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
            <div>
              <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>Is my donation tax-deductible?</h4>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Yes! The Shepherds Community Centre is a registered non-profit 501(c)(3) organization. You will receive a receipt for tax documentation.
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>Can I modify or cancel my monthly donation?</h4>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Absolutely! You can manage your subscription anytime via your account dashboard or by contacting us directly.
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>Are there other ways to give?</h4>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Yes! You can also donate via bank transfer, check, or stock donation. <Link to="/contact" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Contact us</Link> for details.
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>How is my money used?</h4>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Our annual financial reports are available upon request. We're committed to transparency and stewardship of your generous gifts.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{
          backgroundColor: 'var(--color-background-secondary)',
          padding: 'var(--spacing-2xl)',
          borderRadius: 'var(--radius-lg)',
          marginTop: 'var(--spacing-3xl)',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Questions About Giving?</h2>
          <p style={{ marginBottom: 'var(--spacing-lg)', fontSize: '1.05rem', color: 'var(--color-text-secondary)' }}>
            Our team is here to help. Reach out anytime—we'd love to hear from you!
          </p>
          <Link to="/contact">
            <Button variant="primary" size="lg">Contact Us</Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
