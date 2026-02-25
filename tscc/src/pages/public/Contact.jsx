import React, { useState } from 'react';
import { Button, Card, CardBody, Spinner } from '@/components/shared';
import API from '@/services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await API.post('/contact', formData);
      console.log('Message submitted successfully:', response);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Error submitting contact form:', err);
      const errorMessage = err?.message || 'Failed to send message. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Success Modal - Centered on Screen */}
      {submitted && (
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
            padding: 'var(--spacing-3xl)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            animation: 'fadeIn 0.3s ease-in'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: 'var(--spacing-lg)',
              color: '#22c55e'
            }}>
              ✓
            </div>
            <h2 style={{ marginBottom: 'var(--spacing-md)', color: '#22c55e' }}>
              Message Sent Successfully!
            </h2>
            <p style={{ 
              marginBottom: 'var(--spacing-lg)',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.6'
            }}>
              Thank you for reaching out to us. We've received your message and will get back to you as soon as possible.
            </p>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)'
            }}>
              This message will close in 5 seconds...
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section" style={{ minHeight: '40vh' }}>
        <div className="hero-content">
          <h1 className="hero-title">Get In Touch</h1>
          <p className="hero-subtitle">We'd Love to Hear From You</p>
        </div>
      </section>

      {/* Content */}
      <div className="container" style={{ paddingTop: 'var(--spacing-3xl)', paddingBottom: 'var(--spacing-3xl)' }}>
        <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-3xl)', alignItems: 'start' }}>
          {/* Contact Info */}
          <div>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Contact Information</h2>
            <p style={{ marginBottom: 'var(--spacing-2xl)', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
              Have questions or want to get connected? Reach out to us anytime. We're here to help and love hearing from our community.
            </p>

            <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-md)' }}>📍 Location</h4>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                The Shepherds Community Centre Resurrection<br/>
                Brgy. Holy Redeemer P-8 <br/>
                Butuan City, Agusan del Norte, Philippines
              </p>
            </div>

            <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-md)' }}>📞 Phone</h4>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                <a href="tel:+639919357954" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
                  (+63) 991-935-7954
                </a>
              </p>
            </div>

            <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
              <h4 style={{ marginBottom: 'var(--spacing-md)' }}>📧 Email</h4>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                <a href="mailto:tsccresurrection@gmail.com" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
                  tsccresurrection@gmail.com
                </a>
              </p>
            </div>

            <div>
              <h4 style={{ marginBottom: 'var(--spacing-md)' }}>⏰ Service Times</h4>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Sunday Worship: 3:00 PM - 5:00 PM<br/>
                Mentoring: Tuesday 7:00 PM<br/>
                Youth Fellowship: Saturday 6:00 PM
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardBody>
                <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Send us a Message</h2>
                
                {error && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-lg)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    <strong>Error:</strong> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Your full name"
                    />
                  </div>

                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Phone (optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="+63 991-935-7954"
                    />
                  </div>

                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="What is this about?"
                    />
                  </div>

                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="form-input"
                      placeholder="Your message here..."
                      style={{ fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%' }}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
