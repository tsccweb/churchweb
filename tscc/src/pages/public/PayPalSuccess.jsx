import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, CardBody } from '@/components/shared';
import API from '@/services/api';

export default function PayPalSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(true);

  const donationId = searchParams.get('donation_id');

  useEffect(() => {
    const fetchDonation = async () => {
      if (!donationId) {
        setError('No donation found');
        setLoading(false);
        return;
      }

      try {
        const response = await API.get(`/donations/${donationId}`);
        setDonation(response);
      } catch (err) {
        setError(err.message || 'Failed to load donation details');
        console.error('Error fetching donation:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [donationId]);

  const handleClose = () => {
    setShowModal(false);
    navigate('/');
  };

  const handleDonate = () => {
    setShowModal(false);
    navigate('/donate');
  };

  if (!showModal) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <Card style={{
        maxWidth: '500px',
        width: '90%',
        animation: 'slideInUp 0.3s ease-out',
      }}>
        <CardBody style={{
          padding: 'var(--spacing-2xl)',
          textAlign: 'center',
        }}>
          {/* Success Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto var(--spacing-lg)',
            backgroundColor: '#d1fae5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
          }}>
            ✓
          </div>

          {/* Title */}
          {loading ? (
            <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Processing...</h2>
          ) : error ? (
            <>
              <h2 style={{ color: '#dc2626', marginBottom: 'var(--spacing-md)' }}>Payment Error</h2>
              <p style={{ color: '#6b7280', marginBottom: 'var(--spacing-lg)' }}>{error}</p>
            </>
          ) : (
            <>
              <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Thank You! 🙏</h2>
              <p style={{ color: '#6b7280', marginBottom: 'var(--spacing-lg)', lineHeight: '1.6' }}>
                Your generous donation has been received and will make a real difference in our community.
              </p>

              {/* Donation Details */}
              {donation && (
                <div style={{
                  backgroundColor: 'var(--color-background)',
                  padding: 'var(--spacing-lg)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--spacing-lg)',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        Amount
                      </p>
                      <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#10b981' }}>
                        ${parseFloat(donation.amount).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        Payment Method
                      </p>
                      <p style={{ fontSize: '1rem', fontWeight: '500' }}>
                        PayPal 🅿️
                      </p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        Donor Name
                      </p>
                      <p style={{ fontSize: '1rem', fontWeight: '500' }}>
                        {donation.donor_name}
                      </p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        Donation ID
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        color: '#9ca3af',
                        wordBreak: 'break-all',
                      }}>
                        {donation.id}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: 'var(--spacing-lg)',
              }}>
                A confirmation email has been sent to your email address.
              </p>
            </>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            flexDirection: 'column',
          }}>
            <Button
              onClick={handleClose}
              style={{
                width: '100%',
                backgroundColor: '#10b981',
                color: 'white',
              }}
            >
              Return to Home
            </Button>
            {!loading && !error && (
              <Button
                onClick={handleDonate}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Make Another Donation
              </Button>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: 'var(--spacing-md)',
              right: 'var(--spacing-md)',
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--color-background)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            ✕
          </button>
        </CardBody>
      </Card>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
