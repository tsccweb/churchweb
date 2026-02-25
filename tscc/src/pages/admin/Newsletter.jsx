import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Button } from '../../components/shared';

export default function Newsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/admin/newsletter/subscribers?page=${currentPage}&limit=20`);
      console.log('Full API Response:', response);
      
      // Handle both response formats:
      // 1. Direct array: [...]
      // 2. Wrapped object: { data: [...], last_page: ... }
      let subscriberList = [];
      let lastPage = 1;
      
      if (Array.isArray(response.data)) {
        // API returns direct array
        subscriberList = response.data;
      } else if (response.data?.data) {
        // API returns wrapped pagination object
        subscriberList = response.data.data;
        lastPage = response.data.last_page || 1;
      }
      
      console.log('Extracted subscribers:', subscriberList);
      
      setSubscribers(subscriberList);
      setTotalPages(lastPage);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      setMessage('Failed to load subscribers: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewsletter = async (e) => {
    e.preventDefault();

    if (!subject.trim()) {
      setMessage('Subject is required');
      return;
    }

    if (!content.trim()) {
      setMessage('Content is required');
      return;
    }

    if (subscribers.length === 0) {
      setMessage('No subscribers to send to');
      return;
    }

    try {
      setSending(true);
      const response = await API.post('/admin/newsletter/send', {
        subject,
        content,
      });

      setMessage(`Newsletter sent successfully! Sent: ${response.data.sent}, Failed: ${response.data.failed}`);
      setSubject('');
      setContent('');
    } catch (error) {
      console.error('Error sending newsletter:', error);
      setMessage(error.response?.data?.message || 'Failed to send newsletter');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1>Newsletter Management</h1>

      {message && (
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '0.5rem',
          backgroundColor: message.includes('success') ? '#d1fae5' : '#fee2e2',
          color: message.includes('success') ? '#065f46' : '#7f1d1d',
          border: `1px solid ${message.includes('success') ? '#a7f3d0' : '#fecaca'}`,
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Send Newsletter Form */}
        <div style={{
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          backgroundColor: '#f9fafb',
        }}>
          <h2 style={{ marginTop: 0 }}>Send Newsletter</h2>

          <form onSubmit={handleSendNewsletter}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Subject
              </label>
              <input
                type="text"
                placeholder="Newsletter subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Content
              </label>
              <textarea
                placeholder="Newsletter content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={sending || subscribers.length === 0}
              style={{ width: '100%' }}
            >
              {sending ? 'Sending...' : `Send to ${subscribers.length} subscribers`}
            </Button>
          </form>
        </div>

        {/* Subscribers List */}
        <div style={{
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          backgroundColor: '#f9fafb',
        }}>
          <h2 style={{ marginTop: 0 }}>Newsletter Subscribers ({subscribers.length})</h2>

          {loading ? (
            <p>Loading subscribers...</p>
          ) : subscribers.length > 0 ? (
            <>
              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                marginBottom: '1rem',
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem',
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #d1d5db', backgroundColor: '#f3f4f6' }}>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Subscribed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((subscriber) => (
                      <tr key={subscriber.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.5rem' }}>{subscriber.email}</td>
                        <td style={{ padding: '0.5rem' }}>
                          {new Date(subscriber.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '1rem',
                }}>
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span style={{ padding: '0.5rem', lineHeight: '2.5' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: '#6b7280' }}>No subscribers yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
