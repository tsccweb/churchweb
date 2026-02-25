import React from 'react';
import { Button } from '@/components/shared';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero-section" style={{ minHeight: '40vh' }}>
        <div className="hero-content">
          <h1 className="hero-title">About TSCC</h1>
          <p className="hero-subtitle">Walking Together in Faith, Building Community</p>
        </div>
        <div className="hero-overlay"></div>
      </section>

      {/* Main Content */}
      <div className="container" style={{ paddingTop: 'var(--spacing-3xl)', paddingBottom: 'var(--spacing-3xl)' }}>
        {/* Mission Statement */}
        <section style={{ marginBottom: 'var(--spacing-3xl)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
            <h2>Our Mission</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
              To proclaim the Gospel of Jesus Christ, nurture spiritual growth, serve our community with compassion, 
              and build an inclusive fellowship where all are welcomed to experience God's love and grace.
            </p>
          </div>
        </section>

        {/* Core Values */}
        <section style={{ marginBottom: 'var(--spacing-3xl)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>Our Core Values</h2>
          <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-lg)' }}>
            <div style={{ 
              padding: 'var(--spacing-xl)', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 'var(--spacing-md)' }}>✝️ Faith</h3>
              <p>Rooted in Scripture and centered on Christ, our faith is the foundation of everything we do. We believe in the transformative power of God's Word.</p>
            </div>
            <div style={{ 
              padding: 'var(--spacing-xl)', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 'var(--spacing-md)' }}>❤️ Community</h3>
              <p>We are stronger together. We cultivate genuine relationships, support one another, and celebrate life's victories while standing alongside in times of need.</p>
            </div>
            <div style={{ 
              padding: 'var(--spacing-xl)', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 'var(--spacing-md)' }}>🤝 Service</h3>
              <p>We serve our neighbors with humility and love. Outreach, compassion, and practical help are expressions of our faith in action.</p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section style={{ marginBottom: 'var(--spacing-3xl)', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Our Story</h2>
          <p style={{ marginBottom: 'var(--spacing-md)', lineHeight: '1.8' }}>
            The Shepherds Community Centre was founded on the belief that faith communities should be welcoming, 
            authentic, and engaged. For years, we have served as a beacon of hope in our community, providing 
            spiritual guidance, practical support, and a place of belonging for all who walk through our doors.
          </p>
          <p style={{ marginBottom: 'var(--spacing-md)', lineHeight: '1.8' }}>
            Our "Resurrection" initiative represents a renewed commitment to our mission—revitalizing our ministries, 
            expanding our outreach, and deepening our impact in the lives of individuals and families. We believe 
            this is our season of growth, renewal, and transformation.
          </p>
          <p style={{ lineHeight: '1.8' }}>
            Whether you've been with us from the beginning or are visiting for the first time, you are part of our 
            story. We invite you to join us as we continue walking together in faith, serving our neighbors, and 
            building a stronger, more compassionate community.
          </p>
        </section>

        {/* What We Offer */}
        <section style={{ marginBottom: 'var(--spacing-3xl)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>What We Offer</h2>
          <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)' }}>
            <div>
              <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-md)' }}>🎓 Ministries & Teaching</h4>
              <p>Engaging teachings from Scripture to help you grow spiritually and apply faith to everyday life.</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-md)' }}>📅 Community Events</h4>
              <p>Gatherings that strengthen our bonds, celebrate faith, and serve those in need.</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-md)' }}>💝 Support & Counseling</h4>
              <p>Compassionate care during life's challenges, prayer support, and spiritual guidance.</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-md)' }}>🙏 Prayer & Worship</h4>
              <p>Meaningful worship experiences and prayerful spaces to encounter God's presence.</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section style={{ 
          backgroundColor: 'var(--color-primary)', 
          color: 'white', 
          padding: 'var(--spacing-2xl)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          marginBottom: 'var(--spacing-3xl)'
        }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)', color: 'white' }}>Ready to Join Our Community?</h2>
          <p style={{ marginBottom: 'var(--spacing-lg)', fontSize: '1.1rem' }}>
            We'd love to meet you! Visit us this Sunday or any time for our events and gatherings.
          </p>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/events">
              <Button variant="secondary">View Events</Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary">Get In Touch</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
