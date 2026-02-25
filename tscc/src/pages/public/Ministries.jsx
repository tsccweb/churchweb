import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, Badge, Spinner } from '@/components/shared';
import API from '@/services/api';
import checkIntersection from '@/utils/intersection-observer';

export default function Ministries() {
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [heroImage, setHeroImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch ministries
        const ministriesResponse = await API.get('/ministries?limit=12');
        const data = ministriesResponse?.data || ministriesResponse || [];
        console.log('Ministries data:', data);
        setMinistries(data);

        // Fetch section hero image
        const heroResponse = await API.get('/section-heroes/ministries');
        console.log('Hero image response:', heroResponse);
        setHeroImage(heroResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    checkIntersection('.fade-in-up');
  }, []);

  return (
    <div className="ministries-page">
      {/* Hero Section */}
      <section className="hero-section" style={{
        minHeight: '80vh',
        backgroundImage: heroImage ? `url(${heroImage.image_url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative'
      }}>
        {/* Overlay for better text readability */}
        {heroImage && <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1
        }}></div>}
        <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="hero-title">Our Ministries</h1>
          <p className="hero-subtitle">Spiritual Growth Through God's Word</p>
        </div>
      </section>

      {/* Content */}
      <div className="container" style={{ paddingTop: 'var(--spacing-3xl)', paddingBottom: 'var(--spacing-3xl)' }}>
        <div style={{ marginBottom: 'var(--spacing-2xl)', textAlign: 'center' }}>
          <h2>Latest Ministries</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-md)' }}>
            Explore our collection of inspiring messages and teachings from our pastors
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <Spinner />
          </div>
        ) : ministries.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--spacing-lg)'
          }}>
            {ministries.map((ministry) => (
              <Link key={ministry.id} to={`/ministries/${ministry.id}`} style={{ textDecoration: 'none' }}>
                <Card className="fade-in-up" style={{ overflow: 'hidden', cursor: 'pointer', height: '100%' }}>
                  <div style={{
                    width: '100%',
                    height: '180px',
                    backgroundColor: 'var(--color-background-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img
                      key={ministry.id}
                      src={ministry.thumbnail_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop'}
                      alt={ministry.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop';
                      }}
                    />
                  </div>
                  <CardBody>
                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>{ministry.title}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)', fontSize: '0.95rem' }}>
                      {ministry.description?.substring(0, 80)}...
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--spacing-md)' }}>
                      <Badge>{ministry.speaker}</Badge>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        {new Date(ministry.sermon_date).toLocaleDateString()}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--spacing-3xl)' }}>
            No ministries available yet. Check back soon!
          </p>
        )}
      </div>
    </div>
  );
}
