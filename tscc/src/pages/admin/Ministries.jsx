import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Badge, Spinner } from '@/components/shared';
import API from '@/services/api';

export default function AdminMinistries() {
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    speaker: '',
    sermon_date: '',
    video_url: '',
    audio_url: '',
    thumbnail_url: '',
    thumbnail_file: null,
    thumbnail_preview: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMinistries();
  }, []);

  const fetchMinistries = async () => {
    try {
      setLoading(true);
      const response = await API.get('/ministries?limit=50');
      setMinistries(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching ministries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          thumbnail_file: file, 
          thumbnail_preview: reader.result,
          thumbnail_url: '' // Clear old URL when new file selected
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUploading(true);
    try {
      // Prepare data
      let submitData = { ...formData };
      delete submitData.thumbnail_preview;
      delete submitData.thumbnail_file;
      
      // Filter out empty strings
      submitData = Object.fromEntries(
        Object.entries(submitData).filter(([_, value]) => value !== '')
      );
      
      console.log('Submit data:', submitData);
      console.log('Has file:', !!formData.thumbnail_file);
      
      // If file upload exists, use FormData
      if (formData.thumbnail_file) {
        console.log('Uploading file:', formData.thumbnail_file.name, 'Size:', formData.thumbnail_file.size);
        const formDataObj = new FormData();
        
        // Append all text fields
        formDataObj.append('title', formData.title);
        formDataObj.append('description', formData.description || '');
        formDataObj.append('speaker', formData.speaker);
        formDataObj.append('sermon_date', formData.sermon_date);
        
        // Append file
        formDataObj.append('thumbnail_file', formData.thumbnail_file);
        
        console.log('FormData prepared, making request...');
        
        if (editingId) {
          const response = await API.put(`/admin/ministries/${editingId}`, formDataObj, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          console.log('✓ Update response thumbnail_url:', response.thumbnail_url);
          console.log('✓ Updated ministry:', response);
          setSuccess('✓ Ministry updated with new image: ' + (response.thumbnail_url || 'No URL returned'));
        } else {
          const response = await API.post('/admin/ministries', formDataObj, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          console.log('✓ Create response thumbnail_url:', response.thumbnail_url);
          console.log('✓ Created ministry:', response);
          setSuccess('✓ Ministry created with image: ' + (response.thumbnail_url || 'No URL returned'));
        }
      } else {
        // No file, send JSON
        if (editingId) {
          const response = await API.put(`/admin/ministries/${editingId}`, submitData);
          console.log('Update response (no file):', response);
          setSuccess('Ministry updated successfully!');
        } else {
          const response = await API.post('/admin/ministries', submitData);
          console.log('Create response (no file):', response);
          setSuccess('Ministry created successfully!');
        }
      }
      
      // Refresh after a short delay to ensure DB is updated
      setTimeout(async () => {
        console.log('Refreshing ministries list...');
        await fetchMinistries();
        resetForm();
      }, 500);
      
      setTimeout(() => setSuccess(''), 4000);
    } catch (error) {
      console.error('❌ Full error:', error);
      console.error('❌ Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors || 'Failed to save ministry. Please check the form and try again.';
      setError('❌ ' + (typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage));
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (ministry) => {
    // Format date for input field (yyyy-MM-dd)
    let formattedDate = '';
    if (ministry.sermon_date) {
      const dateObj = new Date(ministry.sermon_date);
      formattedDate = dateObj.toISOString().split('T')[0]; // Gets yyyy-MM-dd
    }
    
    // Ensure all fields are present
    setFormData({
      title: ministry.title || '',
      description: ministry.description || '',
      speaker: ministry.speaker || '',
      sermon_date: formattedDate,
      video_url: ministry.video_url || '',
      audio_url: ministry.audio_url || '',
      thumbnail_url: ministry.thumbnail_url || '',
      thumbnail_file: null,
      thumbnail_preview: ministry.thumbnail_url || ''
    });
    setEditingId(ministry.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ministry?')) {
      try {
        await API.delete(`/admin/ministries/${id}`);
        fetchMinistries();
      } catch (error) {
        console.error('Error deleting ministry:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', speaker: '', sermon_date: '', video_url: '', audio_url: '', thumbnail_url: '', thumbnail_file: null, thumbnail_preview: null });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredMinistries = ministries.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-ministries">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <h1>Ministries Management</h1>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Ministry'}
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div style={{
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-md)',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)',
          color: '#991b1b'
        }}>
          ❌ {error}
        </div>
      )}
      {success && (
        <div style={{
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-md)',
          backgroundColor: '#dcfce7',
          border: '1px solid #86efac',
          borderRadius: 'var(--radius-md)',
          color: '#166534'
        }}>
          ✅ {success}
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <input
          type="text"
          placeholder="Search by title or speaker..."
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
            <h2>{editingId ? 'Edit Ministry' : 'Add New Ministry'}</h2>
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
                  placeholder="Enter ministry description (e.g., Teaching, Worship, Prayer, Community Service)"
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
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Speaker</label>
                  <input
                    type="text"
                    name="speaker"
                    value={formData.speaker}
                    onChange={handleInputChange}
                    placeholder="Pastor name"
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
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Ministry Date</label>
                  <input
                    type="date"
                    name="sermon_date"
                    value={formData.sermon_date}
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
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Video URL</label>
                <input
                  type="url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/embed/..."
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
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Audio URL</label>
                <input
                  type="url"
                  name="audio_url"
                  value={formData.audio_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/audio.mp3"
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>📤 Upload Thumbnail Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-md)',
                        border: '2px dashed var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.95rem',
                        cursor: 'pointer'
                      }}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                      JPG, PNG, GIF (Max 5MB)
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>🔗 OR Image URL</label>
                    <input
                      type="url"
                      name="thumbnail_url"
                      value={formData.thumbnail_url}
                      onChange={handleInputChange}
                      placeholder="https://images.unsplash.com/..."
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-md)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1rem'
                      }}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                      Paste image URL as alternative
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                  💡 Upload takes priority over URL if both provided
                </p>
                {(formData.thumbnail_preview || formData.thumbnail_url) && (
                  <div style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '2px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--color-background-secondary)',
                    marginTop: 'var(--spacing-md)'
                  }}>
                    <img src={formData.thumbnail_preview || formData.thumbnail_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <Button variant="primary" type="submit" disabled={uploading}>
                  {uploading ? '⏳ Uploading...' : (editingId ? 'Update Ministry' : 'Create Ministry')}
                </Button>
                <Button variant="secondary" type="button" onClick={resetForm} disabled={uploading}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Ministries Table */}
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
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: '600' }}>Speaker</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMinistries.length > 0 ? (
                    filteredMinistries.map((ministry) => (
                      <tr key={ministry.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: 'var(--spacing-md)' }}>
                          {ministry.thumbnail_url ? (
                            <img
                              key={ministry.id}
                              src={ministry.thumbnail_url}
                              alt={ministry.title}
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
                          <strong>{ministry.title}</strong>
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            {ministry.description?.substring(0, 60)}...
                          </p>
                        </td>
                        <td style={{ padding: 'var(--spacing-md)' }}>{ministry.speaker || '-'}</td>
                        <td style={{ padding: 'var(--spacing-md)' }}>
                          {new Date(ministry.sermon_date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(ministry)}
                            style={{ marginRight: 'var(--spacing-sm)' }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDelete(ministry.id)}
                            style={{ color: '#ef4444' }}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                        No ministries found
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
