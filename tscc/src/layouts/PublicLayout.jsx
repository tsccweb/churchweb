import { Outlet, Link } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/shared';

export default function PublicLayout() {
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
            TSCC Resurrection
          </Link>
          
          <button 
            className="navbar-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <ul className={`navbar-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <li className="navbar-item"><Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link></li>
            <li className="navbar-item"><Link to="/ministries" onClick={() => setMobileMenuOpen(false)}>Ministries</Link></li>
            <li className="navbar-item"><Link to="/events" onClick={() => setMobileMenuOpen(false)}>Events</Link></li>
            <li className="navbar-item"><Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link></li>
            <li className="navbar-item">
              <Link to="/donate" style={{ textDecoration: 'none' }} onClick={() => setMobileMenuOpen(false)}>
                <Button 
                  variant="primary" 
                  size="sm"
                >
                  Donate
                </Button>
              </Link>
            </li>
            <li className="navbar-item">
              <Button 
                className="theme-toggle"
                onClick={toggleTheme}
                title={isDark ? 'Light Mode' : 'Dark Mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </Button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--spacing-2xl) var(--spacing-lg)', marginTop: 'var(--spacing-3xl)' }}>
        <div className="container">
          <div className="grid grid-cols-3" style={{ marginBottom: 'var(--spacing-2xl)', gap: 'var(--spacing-2xl)' }}>
            <div className="footer-column">
              <h4>The Shepherds Community Centre</h4>
              <p>Resurrection - Building Faith & Community</p>
            </div>
            <div className="footer-column">
              <h5>Quick Links</h5>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}><Link to="/about" style={{ color: 'var(--color-text-primary)', textDecoration: 'none' }}>About Us</Link></li>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}><Link to="/ministries" style={{ color: 'var(--color-text-primary)', textDecoration: 'none' }}>Ministries</Link></li>
                <li><Link to="/events" style={{ color: 'var(--color-text-primary)', textDecoration: 'none' }}>Events</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h5>Connect</h5>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <a href="mailto:tsccresurrection@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--color-text-primary)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    tsccresurrection@gmail.com
                  </a>
                </li>
                <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <a href="tel:+639919357954" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--color-text-primary)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    +63 (991) 935-7954
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div style={{ 
            textAlign: 'center', 
            paddingTop: 'var(--spacing-lg)', 
            borderTop: '1px solid var(--color-border)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)'
          }}>
            <p>&copy; 2026 The Shepherds Community Centre. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
