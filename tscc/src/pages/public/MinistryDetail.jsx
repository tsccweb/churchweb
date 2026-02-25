import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardBody, Badge, Spinner, Button } from '@/components/shared';
import API from '@/services/api';

export default function MinistryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ministry, setMinistry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMinistry = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/ministries/${id}`);
        setMinistry(response.data || response);
      } catch (err) {
        setError('Failed to load ministry details');
        console.error('Error fetching ministry:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMinistry();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spinner />
      </div>
    );
  }

  if (error || !ministry) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-3xl)', paddingBottom: 'var(--spacing-3xl)' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Ministry Not Found</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-md)' }}>
            {error || 'The ministry you are looking for does not exist.'}
          </p>
          <Link to="/ministries">
            <Button variant="primary" style={{ marginTop: 'var(--spacing-lg)' }}>
              ← Back to Ministries
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ministry-detail-page">
      {/* Hero Section with Image */}
      <section style={{ 
        position: 'relative', 
        minHeight: '50vh',
        backgroundColor: 'var(--color-background-secondary)',
        overflow: 'hidden'
      }}>
        {ministry.thumbnail_url ? (
          <img 
            src={ministry.thumbnail_url} 
            alt={ministry.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        ) : null}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'var(--spacing-3xl)'
        }}>
          <div style={{ color: 'white' }}>
            <Link to="/ministries" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" style={{ marginBottom: 'var(--spacing-lg)' }}>
                ← Back to Ministries
              </Button>
            </Link>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: 'var(--spacing-md)' }}>
              {ministry.title}
            </h1>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
              <Badge style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '1rem' }}>
                👤 {ministry.speaker}
              </Badge>
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>
                📅 {new Date(ministry.sermon_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="container" style={{ paddingTop: 'var(--spacing-3xl)', paddingBottom: 'var(--spacing-3xl)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 'var(--spacing-2xl)', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Main Content */}
          <div>
            {/* Description */}
            {ministry.description && (
              <Card style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <CardBody>
                  <h2 style={{ marginBottom: 'var(--spacing-md)' }}>About This Ministry</h2>
                  <p style={{ lineHeight: '1.8', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>
                    {ministry.description}
                  </p>
                </CardBody>
              </Card>
            )}

            {/* Audio Player */}
            {ministry.audio_url && (
              <Card style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <CardBody>
                  <h2 style={{ marginBottom: 'var(--spacing-md)' }}>📻 Listen</h2>
                  <audio 
                    controls 
                    style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                  >
                    <source src={ministry.audio_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </CardBody>
              </Card>
            )}

            {/* Video Player */}
            {ministry.video_url && (
              <Card>
                <CardBody>
                  <h2 style={{ marginBottom: 'var(--spacing-md)' }}>🎬 Watch</h2>
                  {ministry.video_url.includes('youtube.com') || ministry.video_url.includes('youtu.be') ? (
                    <iframe
                      width="100%"
                      height="400"
                      src={ministry.video_url.replace('watch?v=', 'embed/').replace('.be/', '.be/')}
                      title={ministry.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ borderRadius: 'var(--radius-md)', marginTop: 'var(--spacing-md)' }}
                    />
                  ) : (
                    <video 
                      controls 
                      style={{ width: '100%', marginTop: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}
                    >
                      <source src={ministry.video_url} type="video/mp4" />
                      Your browser does not support the video element.
                    </video>
                  )}
                </CardBody>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            <Card style={{ position: 'sticky', top: 'var(--spacing-lg)' }}>
              <CardBody>
                <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Details</h3>
                
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                    SPEAKER
                  </p>
                  <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                    {ministry.speaker}
                  </p>
                </div>

                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                    DATE
                  </p>
                  <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                    {new Date(ministry.sermon_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                {ministry.category && (
                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                      CATEGORY
                    </p>
                    <Badge>{ministry.category}</Badge>
                  </div>
                )}

                <div style={{ 
                  paddingTop: 'var(--spacing-lg)', 
                  borderTop: '1px solid var(--color-border)',
                  marginTop: 'var(--spacing-lg)'
                }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    Updated {new Date(ministry.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <Link to="/ministries" style={{ textDecoration: 'none', display: 'block', marginTop: 'var(--spacing-lg)' }}>
                  <Button variant="primary" style={{ width: '100%' }}>
                    ← Back to List
                  </Button>
                </Link>
              </CardBody>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
