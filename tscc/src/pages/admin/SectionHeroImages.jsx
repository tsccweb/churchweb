import React, { useState, useEffect } from 'react';
import { Card, CardBody, Badge, Spinner, Button } from '@/components/shared';
import API from '@/services/api';

export default function SectionHeroImages() {
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    section: '', 
    title: '',
    image_file: null, 
    image_preview: null,
    image_url: ''
  });

  const sections = ['ministries', 'events'];

  const fetchHeroImages = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/section-heroes');
      setHeroImages(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching hero images:', err);
      setError('Failed to load section hero images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image_file: file,
          image_preview: reader.result,
          image_url: '' // Clear URL when file is selected
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      // Validate required fields
      if (!formData.section) {
        setError('Please select a section');
        return;
      }

      if (!formData.image_file && !formData.image_url) {
        setError('Please upload an image or provide an image URL');
        return;
      }

      // If there's a file, use FormData with multipart
      if (formData.image_file) {
        const formDataObj = new FormData();
        formDataObj.append('section', formData.section);
        if (formData.title) formDataObj.append('title', formData.title);
        formDataObj.append('image_file', formData.image_file);

        console.log('Submitting file upload for section:', formData.section);
        
        if (editingId) {
          await API.put(`/admin/section-heroes/${editingId}`, formDataObj);
          setSuccess('Hero image updated successfully!');
        } else {
          await API.post('/admin/section-heroes', formDataObj);
          setSuccess('Hero image added successfully!');
        }
      } else {
        // No file, just URL - send as JSON
        console.log('Submitting URL only for section:', formData.section);
        const jsonData = {
          section: formData.section,
          title: formData.title || '',
          image_url: formData.image_url
        };
        
        if (editingId) {
          await API.put(`/admin/section-heroes/${editingId}`, jsonData);
          setSuccess('Hero image updated successfully!');
        } else {
          await API.post('/admin/section-heroes', jsonData);
          setSuccess('Hero image added successfully!');
        }
      }

      resetForm();
      fetchHeroImages();
    } catch (err) {
      console.error('Error saving hero image:', err);
      console.error('Response data:', err.response?.data);
      const message = err.response?.data?.message || 
                     (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') :
                     'Failed to save hero image');
      setError(message);
    }
  };

  const handleEdit = (heroImage) => {
    setFormData({
      section: heroImage.section,
      title: heroImage.title || '',
      image_file: null,
      image_preview: heroImage.image_url,
      image_url: heroImage.image_url || ''
    });
    setEditingId(heroImage.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this section hero image?')) {
      try {
        await API.delete(`/admin/section-heroes/${id}`);
        setSuccess('Hero image deleted successfully!');
        fetchHeroImages();
      } catch (error) {
        console.error('Error deleting hero image:', error);
        setError('Failed to delete hero image');
      }
    }
  };

  const resetForm = () => {
    setFormData({ section: '', title: '', image_file: null, image_preview: null, image_url: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div style={{ padding: 'var(--spacing-lg)' }}>
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Section Hero Images</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Upload hero images for Ministries, Events, and other page sections
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-lg)',
          border: '1px solid #fecaca'
        }}>
          ✕ {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#d1fae5',
          color: '#166534',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-lg)',
          border: '1px solid #a7f3d0'
        }}>
          ✓ {success}
        </div>
      )}

      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Upload Section Hero'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <CardBody>
            <h2>{editingId ? 'Edit Section Hero' : 'Upload Section Hero Image'}</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: 'var(--spacing-lg)' }}>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Section</label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                  disabled={editingId} // Don't allow changing section on edit
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: 'var(--spacing-md)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select Section</option>
                  {sections.map(section => (
                    <option key={section} value={section}>
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Title (Optional)</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Our Ministries"
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
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Hero Image</label>
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
                  📸 Upload a high-quality image (JPG, PNG, GIF). Max 2MB. Recommended size: 1920x600px
                </p>
                {formData.image_preview && (
                  <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    height: '200px',
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

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Or Paste Image URL (Optional)</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1rem'
                  }}
                />
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                  ℹ️ Provide either an uploaded file OR an external image URL
                </p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <Button variant="primary" type="submit">
                  {editingId ? 'Update Hero' : 'Upload Hero'}
                </Button>
                <Button variant="secondary" type="button" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
          <Spinner />
        </div>
      ) : heroImages.length === 0 ? (
        <Card>
          <CardBody>
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              No section hero images uploaded yet
            </p>
          </CardBody>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
          {heroImages.map(heroImage => (
            <Card key={heroImage.id}>
              <CardBody>
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--spacing-lg)', alignItems: 'start' }}>
                  <div style={{
                    width: '200px',
                    height: '120px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--color-background-secondary)'
                  }}>
                    <img src={heroImage.image_url} alt={heroImage.section} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                      <h3 style={{ margin: 0 }}>{heroImage.section.charAt(0).toUpperCase() + heroImage.section.slice(1)}</h3>
                      <Badge style={{ backgroundColor: heroImage.is_active ? '#22c55e' : '#cbd5e1' }}>
                        {heroImage.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {heroImage.title && <p style={{ margin: '0 0 var(--spacing-md) 0', color: 'var(--color-text-secondary)' }}>{heroImage.title}</p>}
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                      <Button variant="secondary" onClick={() => handleEdit(heroImage)}>
                        Edit
                      </Button>
                      <Button variant="tertiary" onClick={() => handleDelete(heroImage.id)} style={{ color: '#ef4444' }}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
