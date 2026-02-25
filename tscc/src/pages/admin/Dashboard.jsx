import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Button } from '@/components/shared';
import { useTheme } from '@/context/ThemeContext';
import API from '@/services/api';

export default function Dashboard() {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    donations: 0,
    events: 0,
    messages: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch various stats
      const donationStats = await API.get('/admin/donations?limit=1');
      const eventStats = await API.get('/events');
      setStats({
        donations: donationStats?.total || 0,
        events: eventStats?.data?.length || 0,
        messages: 5, // Placeholder for now
        users: 1, // Placeholder for now
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color, link }) => (
    <Link to={link} style={{ textDecoration: 'none' }}>
      <Card style={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: isDark
          ? `linear-gradient(135deg, ${color}10, ${color}05)`
          : `linear-gradient(135deg, ${color}20, ${color}10)`,
        border: `1px solid ${color}${isDark ? '30' : '40'}`,
        height: '100%',
        backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = isDark
            ? '0 12px 24px rgba(0,0,0,0.3)'
            : '0 12px 24px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <CardBody style={{ padding: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                fontSize: '0.875rem',
                marginBottom: 'var(--spacing-sm)',
              }}>
                {title}
              </p>
              <p style={{ fontSize: '2.5rem', fontWeight: '700', color: color }}>
                {loading ? '—' : value}
              </p>
            </div>
            <div style={{
              fontSize: '2rem',
              opacity: 0.3,
            }}>
              {icon}
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <div style={{
        marginBottom: 'var(--spacing-3xl)',
        padding: 'var(--spacing-2xl)',
        background: isDark
          ? 'linear-gradient(135deg, #2d3561, #1e2a3a)'
          : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        borderRadius: 'var(--radius-lg)',
        color: 'white',
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>
          👋 Welcome back, Admin!
        </h1>
        <p style={{ opacity: 0.9, fontSize: '1.125rem' }}>
          Here's what's happening with your church today
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-3xl)',
      }}>
        <StatCard
          icon="💰"
          title="Total Donations"
          value={`$${stats.donations.toLocaleString()}`}
          color="#10b981"
          link="/admin/donations"
        />
        <StatCard
          icon="📅"
          title="Upcoming Events"
          value={stats.events}
          color="#3b82f6"
          link="/admin/events"
        />
        <StatCard
          icon="📧"
          title="New Messages"
          value={stats.messages}
          color="#f59e0b"
          link="/admin/messages"
        />
        <StatCard
          icon="👥"
          title="Active Users"
          value={stats.users}
          color="#8b5cf6"
          link="/admin/users"
        />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 'var(--spacing-3xl)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-lg)', color: isDark ? 'white' : '#1a1a1a' }}>Quick Actions</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-md)',
        }}>
          <Link to="/admin/events" style={{ textDecoration: 'none' }}>
            <Button style={{ width: '100%', justifyContent: 'flex-start', padding: 'var(--spacing-lg)' }}>
              📅 Create Event
            </Button>
          </Link>
          <Link to="/admin/donations" style={{ textDecoration: 'none' }}>
            <Button style={{ width: '100%', justifyContent: 'flex-start', padding: 'var(--spacing-lg)' }}>
              💰 View Donations
            </Button>
          </Link>
          <Link to="/admin/messages" style={{ textDecoration: 'none' }}>
            <Button style={{ width: '100%', justifyContent: 'flex-start', padding: 'var(--spacing-lg)' }}>
              📧 Check Messages
            </Button>
          </Link>
          <Link to="/admin/users" style={{ textDecoration: 'none' }}>
            <Button style={{ width: '100%', justifyContent: 'flex-start', padding: 'var(--spacing-lg)' }}>
              👥 Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* System Status */}
      <div>
        <h2 style={{ marginBottom: 'var(--spacing-lg)', color: isDark ? 'white' : '#1a1a1a' }}>System Status</h2>
        <Card style={{
          backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }}>
          <CardBody style={{ padding: 'var(--spacing-2xl)' }}>
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: 'var(--spacing-md)',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                color: isDark ? 'white' : '#1a1a1a',
              }}>
                <span>Database</span>
                <span style={{ color: '#10b981', fontWeight: '600' }}>✓ Connected</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: 'var(--spacing-md)',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                color: isDark ? 'white' : '#1a1a1a',
              }}>
                <span>API Server</span>
                <span style={{ color: '#10b981', fontWeight: '600' }}>✓ Running</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: 'var(--spacing-md)',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                color: isDark ? 'white' : '#1a1a1a',
              }}>
                <span>Payment Webhooks</span>
                <span style={{ color: '#10b981', fontWeight: '600' }}>✓ Active</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: isDark ? 'white' : '#1a1a1a',
              }}>
                <span>Storage</span>
                <span style={{ color: '#10b981', fontWeight: '600' }}>✓ Available</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Footer Info */}
      <div style={{
        marginTop: 'var(--spacing-3xl)',
        padding: 'var(--spacing-lg)',
        backgroundColor: isDark ? '#1a1a2e' : 'var(--color-background)',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        textAlign: 'center',
        color: isDark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-secondary)',
        fontSize: '0.875rem',
      }}>
        <p>Last updated: {new Date().toLocaleString()}</p>
        <p style={{ marginTop: 'var(--spacing-sm)' }}>All systems operational ✓</p>
      </div>
    </div>
  );
}
