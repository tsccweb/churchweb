import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card } from '../../components/shared';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);
      login(response.user, response.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-background)',
    }} className="animate-fadeIn">
      <div style={{ width: '100%', maxWidth: '400px', padding: 'var(--spacing-lg)' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
            <h1 style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-sm)' }}>
              TSCC Admin
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>Sign in to your account</p>
          </div>

          {error && (
            <div style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              borderLeft: '4px solid var(--color-error)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-lg)',
              color: 'var(--color-error)',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
            
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>

        <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
          Demo credentials: admin@example.com / password
        </p>
      </div>
    </div>
  );
}
