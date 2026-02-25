import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, Badge, Spinner } from '@/components/shared';
import API from '@/services/api';
import checkIntersection from '@/utils/intersection-observer';

export default function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [welcomeImage, setWelcomeImage] = useState('https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=800&fit=crop');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fallback images if no custom images are uploaded
  const defaultImages = useMemo(() => [
    'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1573104821345-be8e9db59eb5?w=1200&h=900&fit=crop',
  ], []);

  // Load hero images from cache first, then fetch fresh
  useEffect(() => {
    const loadHeroImages = async () => {
      try {
        // Check cache first
        const cached = sessionStorage.getItem('heroImages');
        if (cached) {
          setHeroImages(JSON.parse(cached));
          setHeroLoading(false);
        }

        // Fetch fresh images in background
        const heroRes = await API.get('/hero-images').catch(() => ({ data: { data: [] } }));
        const images = heroRes.data?.data || heroRes.data || [];
        const finalImages = images.length > 0 ? images : defaultImages.map((url, i) => ({ id: i, image_url: url, order: i }));
        
        setHeroImages(finalImages);
        sessionStorage.setItem('heroImages', JSON.stringify(finalImages));
        setHeroLoading(false);
      } catch (error) {
        console.error('Error loading hero images:', error);
        const fallbackImages = defaultImages.map((url, i) => ({ id: i, image_url: url, order: i }));
        setHeroImages(fallbackImages);
        setHeroLoading(false);
      }
    };

    loadHeroImages();
  }, [defaultImages]);

  // Load welcome image from gallery
  useEffect(() => {
    const loadWelcomeImage = async () => {
      try {
        const response = await API.get('/gallery/welcome').catch(() => ({ data: [] }));
        const images = response.data?.data || response.data || [];
        if (images.length > 0) {
          // Use the first image ordered by 'order' field
          const sortedImages = images.sort((a, b) => a.order - b.order);
          setWelcomeImage(sortedImages[0].image_url);
        }
      } catch (error) {
        console.error('Error loading welcome image:', error);
      }
    };

    loadWelcomeImage();
  }, []);

  // Fetch announcements
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const announcementsRes = await API.get('/announcements?limit=5&featured=true').catch(() => ({ data: { data: [] } }));
        
        setAnnouncements(announcementsRes.data?.data || announcementsRes.data || []);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    checkIntersection('.fade-in-up');
  }, []);

  // Auto-rotate slideshow every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await API.post('/contact/subscribe', { email });
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <div className="home-page">
      {/* Hero Section - Slideshow */}
      <section style={{ position: 'relative', minHeight: '90vh', overflow: 'hidden' }}>
        {/* Background Slides */}
        {heroImages.map((image, index) => {
          const imageUrl = typeof image === 'string' ? image : image.image_url;
          return (
          <div
            key={`slide-${index}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `linear-gradient(rgba(20, 21, 27, 0.6), rgba(39, 54, 99, 0.6)), url("${imageUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
              opacity: index === currentSlide ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              pointerEvents: 'none'
            }}
          />
        );
        })}

        {/* Fixed Hero Content - Never re-renders */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
          pointerEvents: 'auto'
        }}>
          <div className="hero-content fade-in-down">
            <h1 className="hero-title">The Shepherds Community Centre Resurrection</h1>
            <p className="hero-subtitle">Walking Together in Faith</p>
            <div className="hero-buttons">
              <Link to="/events">
                <Button variant="primary" size="lg">Join Us</Button>
              </Link>
              <Link to="/donate">
                <Button variant="secondary" size="lg">Donate Now</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            zIndex: 10,
          }}
        >
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: index === currentSlide ? '30px' : '12px',
                height: '12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: index === currentSlide ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              title={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-2xl)', alignItems: 'center', marginBottom: 'var(--spacing-3xl)' }}>
            <div className="welcome-content fade-in-up">
              <h2>Welcome to TSCC - Your Spiritual Home</h2>
              <p style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-xl)' }}>
                The Shepherds Community Centre is more than just a church—we're a family united by faith, 
                a beacon of hope in our community, and a place where your spirit can find rest and grow.
              </p>
              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <p>Whether you're searching for spiritual meaning, rebuilding your faith, or simply looking for a welcoming community, 
                you've found home. Every Sunday and throughout the week, we gather to worship, learn, pray, and serve together.</p>
                <p style={{ marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)', fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                  "Come to me, all you who are weary and burdened, and I will give you rest." — Matthew 11:28
                </p>
              </div>
            </div>
            <div className="fade-in-up" style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              height: '400px'
            }}>
              <img src={welcomeImage} alt="Church Community" style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }} />
            </div>
          </div>

          <div className="welcome-content fade-in-up" style={{ marginTop: 'var(--spacing-2xl)' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 'var(--spacing-lg)',
              marginTop: 'var(--spacing-xl)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-md)' }}>🙏</div>
                <h4>Inspiring Teaching</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                  Biblical ministry that transforms hearts and equips us for purposeful living.
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-md)' }}>❤️</div>
                <h4>Genuine Community</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                  Find belonging with people who care about you and walk alongside you in faith.
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-md)' }}>🤝</div>
                <h4>Meaningful Service</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                  Make a real difference through community outreach and serving those in need.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Ministries */}
      <section className="ministries-preview-section">
        <div className="container">
          <div className="section-header">
            <h2>Latest Ministries</h2>
            <Link to="/ministries">
              <Button variant="tertiary">View All</Button>
            </Link>
          </div>

          <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
              Explore our collection of inspiring messages and teachings from our pastors
            </p>
            <Link to="/ministries">
              <Button variant="primary">Explore Ministries →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Community Says</h2>
          <div className="testimonials-grid">
            {[
              {
                name: 'John Smith',
                text: 'TSCC has been a spiritual home for my family. The community here is welcoming and the teachings are transformative.',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
              },
              {
                name: 'Sarah Johnson',
                text: 'I came as a visitor and stayed as a member. The love and support I found here changed my life.',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
              },
              {
                name: 'Michael Davis',
                text: 'The programs and initiatives at TSCC truly make a difference in our community. Grateful to be part of this mission.',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
              },
            ].map((testimonial, index) => (
              <Card key={index} className="testimonial-card fade-in-up">
                <CardBody>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                    <img src={testimonial.avatar} alt={testimonial.name} style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      marginRight: 'var(--spacing-md)',
                      objectFit: 'cover'
                    }} />
                    <div>
                      <p className="testimonial-author" style={{ margin: 0 }}>— {testimonial.name}</p>
                    </div>
                  </div>
                  <p className="testimonial-text">"{testimonial.text}"</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="announcements-section">
          <div className="container">
            <h2 className="section-title">Important Announcements</h2>
            <div className="announcements-list">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="announcement-item fade-in-up">
                  <Badge variant="accent">{announcement.category}</Badge>
                  <h3>{announcement.title}</h3>
                  <p>{announcement.content}</p>
                  <p className="announcement-date">
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content fade-in-up">
            <h2>Stay Connected</h2>
            <p>Subscribe to our newsletter for updates, sermons, and community news.</p>
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="primary">Subscribe</Button>
            </form>
            {subscribed && (
              <p className="success-message">Thank you for subscribing!</p>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Join Our Community?</h2>
          <p>Whether you're looking to deepen your faith, serve others, or simply find community,</p>
          <p>there's a place for you here at The Shepherds Community Centre.</p>
          <div className="cta-buttons">
            <Link to="/events">
              <Button variant="primary" size="lg">Explore Events</Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" size="lg">Get In Touch</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
