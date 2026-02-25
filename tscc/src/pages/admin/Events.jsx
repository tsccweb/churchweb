import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Badge, Spinner } from '@/components/shared';
import API from '@/services/api';

// Helper to format datetime for HTML datetime-local input
const formatDateTimeForInput = (dateString) => {
  if (!dateString) return '';
  try {
    // Handle ISO format: "2026-02-28T11:30:00.000000Z"
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    status: 'upcoming',
    image_url: '',
    image_file: null,
    image_preview: null
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await API.get('/events?limit=50');
      setEvents(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image_file: file,
          image_preview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let dataToSubmit = formData;
      
      // If there's a new image file, use FormData
      if (formData.image_file) {
        const formDataObj = new FormData();
        formDataObj.append('title', formData.title);
        formDataObj.append('description', formData.description);
        formDataObj.append('location', formData.location);
        formDataObj.append('start_date', formData.start_date);
        formDataObj.append('end_date', formData.end_date);
        formDataObj.append('status', formData.status);
        formDataObj.append('image_file', formData.image_file);
        
        if (editingId) {
          await API.put(`/admin/events/${editingId}`, formDataObj, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          await API.post('/admin/events', formDataObj, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      } else {
        // No image file, send as JSON
        const data = {
          title: formData.title,
          description: formData.description,
          location: formData.location,
          start_date: formData.start_date,
          end_date: formData.end_date,
          status: formData.status,
          image_url: formData.image_url
        };
        if (editingId) {
          await API.put(`/admin/events/${editingId}`, data);
        } else {
          await API.post('/admin/events', data);
        }
      }
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEdit = (event) => {
    setFormData({
      ...event,
      start_date: formatDateTimeForInput(event.start_date),
      end_date: formatDateTimeForInput(event.end_date),
      image_file: null,
      image_preview: event.image_url
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await API.delete(`/admin/events/${id}`);
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      description: '', 
      location: '', 
      start_date: '', 
      end_date: '', 
      status: 'upcoming', 
      image_url: '',
      image_file: null,
      image_preview: null
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-events">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <h1>Events Management</h1>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Event'}
        </Button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <input
          type="text"
          placeholder="Search by title or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: 'var(--spacing-md)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <CardBody>
            <h2>{editingId ? 'Edit Event' : 'Add New Event'}</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: 'var(--spacing-lg)' }}>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your event (e.g., Sunday Service, Bible Study, Fellowship Gathering, Prayer Meeting)"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Main Hall, Fellowship Room, Sanctuary"
                    required
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-md)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-md)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Start Date</label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-md)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>End Date</label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-md)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Event Hero Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    border: '2px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    marginBottom: 'var(--spacing-md)'
                  }}
                />
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                  📸 Upload a high-quality image (JPG, PNG, GIF). Max 5MB.
                </p>
                {formData.image_preview && (
                  <div style={{
                    width: '200px',
                    height: '150px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '2px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--color-background-secondary)'
                  }}>
                    <img src={formData.image_preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <Button variant="primary" type="submit">
                  {editingId ? 'Update Event' : 'Create Event'}
                </Button>
                <Button variant="secondary" type="button" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Events Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
          <Spinner />
        </div>
      ) : (
        <Card>
          <CardBody>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.95rem'
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: '600' }}>Image</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: '600' }}>Title</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: '600' }}>Location</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <tr key={event.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: 'var(--spacing-md)' }}>
                          {event.image_url ? (
                            <img
                              src={event.image_url}
                              alt={event.title}
                              style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: 'var(--radius-md)',
                                objectFit: 'cover',
                                border: '1px solid var(--color-border)'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--color-background-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--color-text-secondary)',
                              fontSize: '0.8rem'
                            }}>
                              No image
                            </div>
                          )}
                        </td>
                        <td style={{ padding: 'var(--spacing-md)' }}>
                          <strong>{event.title}</strong>
                        </td>
                        <td style={{ padding: 'var(--spacing-md)' }}>{event.location}</td>
                        <td style={{ padding: 'var(--spacing-md)' }}>
                          {new Date(event.start_date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: 'var(--spacing-md)' }}>

                          <Badge variant={
                            event.status === 'upcoming' ? 'primary' :
                            event.status === 'completed' ? 'success' :
                            event.status === 'cancelled' ? 'danger' :
                            'secondary'
                          }>
                            {event.status}
                          </Badge>
                        </td>
                        <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(event)}
                            style={{ marginRight: 'var(--spacing-sm)' }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDelete(event.id)}
                            style={{ color: '#ef4444' }}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                        No events found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
