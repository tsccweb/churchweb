import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, Badge, Spinner } from '@/components/shared';
import API from '@/services/api';
import checkIntersection from '@/utils/intersection-observer';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await API.get('/events?limit=20');
        // API service already returns response.data, so response is the paginated object
        const data = response?.data || response || [];
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchHeroImage = async () => {
      try {
        const response = await API.get('/section-heroes/events');
        if (response && response.image_url) {
          setHeroImage(response);
        }
      } catch (error) {
        console.error('Error fetching section hero image:', error);
      }
    };

    fetchEvents();
    fetchHeroImage();
    checkIntersection('.fade-in-up');
  }, []);

  return (
    <div className="events-page">
      {/* Hero Section */}
      <section className="hero-section" style={{
        minHeight: '80vh',
        backgroundImage: heroImage?.image_url ? `url("${heroImage.image_url}")` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      }}>
        {/* Dark overlay for text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 0
        }} />
        <div className="hero-content" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="hero-title">Our Events</h1>
          <p className="hero-subtitle">Join Us For Community & Worship</p>
        </div>
      </section>

      {/* Content */}
      <div className="container" style={{ paddingTop: 'var(--spacing-3xl)', paddingBottom: 'var(--spacing-3xl)' }}>
        <div style={{ marginBottom: 'var(--spacing-2xl)', textAlign: 'center' }}>
          <h2>Upcoming Events</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-md)' }}>
            Don't miss out! Join us for worship, fellowship, and community service
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <Spinner />
          </div>
        ) : events.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 'var(--spacing-lg)'
          }}>
            {events.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
                <Card className="fade-in-up" style={{ overflow: 'hidden', cursor: 'pointer', height: '100%' }}>
                  <div style={{
                    width: '100%',
                    height: '180px',
                    backgroundColor: 'var(--color-background-secondary)',
                    backgroundImage: `url("${event.image_url || 'https://images.unsplash.com/photo-1516214104703-3d5333f3566b?w=400&h=300&fit=crop'}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}></div>
                  <CardBody>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                      <Badge>{new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Badge>
                      <Badge variant="secondary">{event.status || 'Upcoming'}</Badge>
                    </div>
                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>{event.title}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                      📍 {event.location}
                    </p>
                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                      {event.description?.substring(0, 100)}...
                    </p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--spacing-3xl)' }}>
            No upcoming events at this time. Please check back soon!
          </p>
        )}
      </div>
    </div>
  );
}
