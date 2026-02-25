import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/shared';
import { useState } from 'react';

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/hero-images', label: 'Hero Images', icon: '🖼️' },
    { path: '/admin/section-heroes', label: 'Section Heroes', icon: '🎨' },
    { path: '/admin/events', label: 'Events', icon: '📅' },
    { path: '/admin/ministries', label: 'Ministries', icon: '⛪' },
    { path: '/admin/donations', label: 'Donations', icon: '💰' },
    { path: '/admin/messages', label: 'Messages', icon: '📧' },
    { path: '/admin/newsletter', label: 'Newsletter', icon: '📬' },
    { path: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: isDark ? '#0f0f1e' : '#f5f5f7' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '280px' : '90px',
        backgroundColor: isDark 
          ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' 
          : 'linear-gradient(180deg, #ffffff 0%, #f8f9fb 100%)',
        borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        padding: '0',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        overflowY: 'auto',
        zIndex: 1000,
        boxShadow: isDark ? '2px 0 10px rgba(0,0,0,0.3)' : '2px 0 10px rgba(0,0,0,0.05)',
      }}>
        {/* Logo Section */}
        <div style={{
          padding: 'var(--spacing-lg)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-md)',
        }}>
          <Link 
            to="/admin/dashboard" 
            style={{
              flex: 1,
              fontSize: sidebarOpen ? '1.125rem' : '0.875rem',
              fontWeight: '700',
              color: isDark ? 'white' : '#1a1a1a',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
              minWidth: 0,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>⛪</span>
            {sidebarOpen && (
              <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                TSCC
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
              cursor: 'pointer',
              fontSize: '1rem',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
              e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
            }}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '‹' : '›'}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: 'var(--spacing-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-xs)',
          overflowY: 'auto',
        }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                padding: sidebarOpen ? 'var(--spacing-md) var(--spacing-lg)' : 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: isActive(item.path) 
                  ? (isDark ? 'white' : '#1a1a1a') 
                  : (isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'),
                display: 'flex',
                alignItems: 'center',
                gap: sidebarOpen ? 'var(--spacing-md)' : '0',
                backgroundColor: isActive(item.path) 
                  ? (isDark ? 'rgba(79, 172, 254, 0.2)' : 'rgba(79, 172, 254, 0.1)')
                  : 'transparent',
                borderLeft: isActive(item.path) 
                  ? '3px solid #4faceffe' 
                  : '3px solid transparent',
                transition: 'all 0.2s ease',
                fontWeight: isActive(item.path) ? '600' : '500',
                fontSize: '0.95rem',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                minHeight: '44px',
              }}
              title={item.label}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = isDark 
                    ? 'rgba(255,255,255,0.05)' 
                    : 'rgba(0,0,0,0.05)';
                  if (sidebarOpen) e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <span style={{ fontSize: '1.25rem', display: 'flex', flexShrink: 0 }}>
                {item.icon}
              </span>
              {sidebarOpen && (
                <span style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {item.label}
                </span>
              )}
              {sidebarOpen && isActive(item.path) && (
                <span style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#4faceffe',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  flexShrink: 0,
                }}></span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div style={{
          padding: 'var(--spacing-lg)',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
          alignItems: sidebarOpen ? 'stretch' : 'center',
        }}>
          {sidebarOpen && (
            <div style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              color: isDark ? 'white' : '#1a1a1a',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            }}>
              <p style={{
                fontSize: '0.75rem',
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: '600',
              }}>
                Logged in as
              </p>
              <p style={{
                fontSize: '0.95rem',
                fontWeight: '700',
                margin: 'var(--spacing-xs) 0 0 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.name || 'Admin'}
              </p>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={toggleTheme}
              style={{
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                border: isDark ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(139, 92, 246, 0.3)',
                color: '#8b5cf6',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-md)',
                width: '100%',
                minHeight: '44px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
              }}
            >
              <span style={{ display: 'flex', flexShrink: 0 }}>
                {isDark ? '☀️' : '🌙'}
              </span>
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: sidebarOpen ? 'var(--spacing-md)' : 'var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: sidebarOpen ? '0.95rem' : '1.2rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: sidebarOpen ? 'var(--spacing-md)' : '0',
              width: '100%',
              minHeight: '44px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              if (sidebarOpen) e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <span style={{ display: 'flex', flexShrink: 0 }}>🚪</span>
            {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>Logout</span>}
          </button>
        </div>

        {/* Animation Styles */}
        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          aside::-webkit-scrollbar {
            width: 6px;
          }

          aside::-webkit-scrollbar-track {
            background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
          }

          aside::-webkit-scrollbar-thumb {
            background: ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
            border-radius: 3px;
          }

          aside::-webkit-scrollbar-thumb:hover {
            background: ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
          }
        `}</style>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '280px' : '90px',
        padding: 'var(--spacing-lg)',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: 'auto',
        backgroundColor: isDark ? '#0f0f1e' : '#f5f5f7',
      }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-2xl)',
          paddingBottom: 'var(--spacing-lg)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}>
          <h1 style={{ margin: 0, color: isDark ? 'white' : '#1a1a1a' }}>Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
            <span style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
              👤 {user?.name || 'Admin'}
            </span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
