import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Spinner } from '@/components/shared';
import API from '@/services/api';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [filter, setFilter] = useState('new'); // new, read, replied, all
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/contact-messages');
      console.log('Contact messages response:', response);
      
      // Handle different response structures
      let allMessages = [];
      if (Array.isArray(response)) {
        allMessages = response;
      } else if (response?.data && Array.isArray(response.data)) {
        allMessages = response.data;
      } else if (response?.data && response.data.data && Array.isArray(response.data.data)) {
        allMessages = response.data.data;
      } else {
        console.warn('Unexpected response structure:', response);
        allMessages = [];
      }
      
      let filteredMessages = allMessages;
      if (filter !== 'all') {
        filteredMessages = filteredMessages.filter(msg => msg.status === filter);
      }
      
      console.log('Filtered messages:', filteredMessages);
      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await API.put(`/admin/contact-messages/${messageId}/read`);
      fetchMessages();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleReply = async (messageId) => {
    if (!replyText.trim()) return;

    try {
      setReplying(true);
      setErrorMessage('');
      const updatedMessage = await API.post(`/admin/contact-messages/${messageId}/reply`, { reply: replyText });
      console.log('Reply sent successfully:', updatedMessage);
      
      // The API service unwraps the response automatically, so updatedMessage is the message object
      setSelectedMessage(updatedMessage);
      
      // Update the messages list
      const updatedMessages = messages.map(msg => 
        msg.id === messageId ? updatedMessage : msg
      );
      setMessages(updatedMessages);
      
      setReplyText('');
      setSuccessMessage('Reply sent successfully and email delivered!');
      
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error replying to message:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send reply. Please try again.';
      setErrorMessage(errorMsg);
      
      // Auto-dismiss error message after 5 seconds
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await API.delete(`/admin/contact-messages/${messageId}`);
        fetchMessages();
        setSelectedMessage(null);
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-lg)' }}>
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Contact Messages</h1>
        
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
          {['new', 'read', 'replied', 'all'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                backgroundColor: filter === status ? 'var(--color-primary)' : 'var(--color-background)',
                color: filter === status ? 'white' : 'var(--color-text-primary)',
                border: `1px solid ${filter === status ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontWeight: filter === status ? 'bold' : 'normal'
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-lg)' }}>
        {/* Messages List */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
              <Spinner />
            </div>
          ) : messages.length === 0 ? (
            <Card>
              <CardBody>
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  No messages found
                </p>
              </CardBody>
            </Card>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                onClick={() => {
                  console.log('Clicked message:', message);
                  setSelectedMessage(message);
                  if (message.status === 'new') {
                    handleMarkAsRead(message.id);
                  }
                }}
                style={{
                  marginBottom: 'var(--spacing-md)',
                  padding: 'var(--spacing-lg)',
                  cursor: 'pointer',
                  backgroundColor: selectedMessage?.id === message.id ? 'var(--color-primary)' : 'var(--color-background)',
                  color: selectedMessage?.id === message.id ? 'white' : 'var(--color-text-primary)',
                  borderLeft: `4px solid ${
                    message.status === 'new' ? '#dc2626' : 
                    message.status === 'replied' ? '#22c55e' : 
                    'var(--color-border)'
                  }`,
                  borderRadius: 'var(--radius-md)',
                  border: selectedMessage?.id === message.id ? '2px solid var(--color-primary-light)' : '1px solid var(--color-border)',
                  transition: 'all 0.2s'
                }}
              >
                <h4 style={{ marginBottom: 'var(--spacing-xs)', margin: 0 }}>{message.name}</h4>
                <p style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  marginBottom: 'var(--spacing-xs)',
                  margin: 'var(--spacing-xs) 0',
                  opacity: 0.9
                }}>
                  {message.subject}
                </p>
                <p style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  margin: 'var(--spacing-xs) 0',
                  opacity: 0.8
                }}>
                  {message.email}
                </p>
                <div style={{ marginTop: 'var(--spacing-sm)' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    backgroundColor: selectedMessage?.id === message.id ? 'rgba(255,255,255,0.3)' : (message.status === 'new' ? '#f87171' : message.status === 'replied' ? '#86efac' : '#cbd5e1'),
                    color: selectedMessage?.id === message.id ? 'white' : (message.status === 'new' ? 'white' : 'black'),
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'bold'
                  }}>
                    {message.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Detail */}
        <div>
          {successMessage && (
            <div style={{
              backgroundColor: '#d1fae5',
              color: '#166534',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-md)',
              border: '1px solid #a7f3d0'
            }}>
              ✓ {successMessage}
            </div>
          )}
          {errorMessage && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-md)',
              border: '1px solid #fecaca'
            }}>
              ✕ {errorMessage}
            </div>
          )}
          {selectedMessage ? (
            <Card>
              <CardBody>
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <h2 style={{ marginBottom: 'var(--spacing-sm)' }}>{selectedMessage.subject}</h2>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                    From: <strong>{selectedMessage.name}</strong> ({selectedMessage.email})
                    {selectedMessage.phone && ` • ${selectedMessage.phone}`}
                  </p>
                  <div style={{
                    backgroundColor: 'var(--color-background)',
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-lg)',
                    minHeight: '150px'
                  }}>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {selectedMessage.message}
                    </p>
                  </div>

                  {selectedMessage.reply && (
                    <div style={{
                      backgroundColor: '#d1fae5',
                      padding: 'var(--spacing-lg)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--spacing-lg)',
                      borderLeft: '4px solid #22c55e'
                    }}>
                      <p style={{ color: '#166534', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>
                        Your Reply:
                      </p>
                      <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#065f46' }}>
                        {selectedMessage.reply}
                      </p>
                      {selectedMessage.replied_at && (
                        <p style={{ fontSize: 'var(--font-size-sm)', color: '#047857', marginTop: 'var(--spacing-sm)' }}>
                          Replied on {new Date(selectedMessage.replied_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>
                      {selectedMessage.reply ? 'Edit or Send Another Reply' : 'Send Reply'}
                    </label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      rows={4}
                      className="form-input"
                      style={{ marginBottom: 'var(--spacing-md)' }}
                    />
                    <Button
                      variant="primary"
                      onClick={() => handleReply(selectedMessage.id)}
                      disabled={replying || !replyText.trim()}
                    >
                      {replying ? 'Sending...' : 'Send Reply'}
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                  {selectedMessage.status === 'new' && (
                    <Button
                      variant="secondary"
                      onClick={() => handleMarkAsRead(selectedMessage.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    variant="tertiary"
                    onClick={() => handleDelete(selectedMessage.id)}
                    style={{ color: '#ef4444' }}
                  >
                    Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody>
                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  Select a message to view details
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
