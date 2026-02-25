import React, { useState, useEffect } from 'react';
import { Card, CardBody, Badge, Spinner, Button } from '@/components/shared';
import API from '@/services/api';

export default function HeroImages() {
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', image_file: null, image_preview: null, order: 0 });

  const fetchHeroImages = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/hero-images');
      setHeroImages(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching hero images:', err);
      setError('Failed to load hero images');
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
          image_preview: reader.result
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

      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('order', formData.order);
      if (formData.image_file) {
        formDataObj.append('image_file', formData.image_file);
      }

      if (editingId) {
        await API.put(`/admin/hero-images/${editingId}`, formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Hero image updated successfully!');
      } else {
        await API.post('/admin/hero-images', formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Hero image added successfully!');
      }

      resetForm();
      fetchHeroImages();
    } catch (err) {
      console.error('Error saving hero image:', err);
      setError(err.response?.data?.message || 'Failed to save hero image');
    }
  };

  const handleEdit = (heroImage) => {
    setFormData({
      title: heroImage.title || '',
      image_file: null,
      image_preview: heroImage.image_url,
      order: heroImage.order || 0
    });
    setEditingId(heroImage.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this hero image?')) {
      try {
        await API.delete(`/admin/hero-images/${id}`);
        setSuccess('Hero image deleted successfully!');
        fetchHeroImages();
      } catch (err) {
        setError('Failed to delete hero image');
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', image_file: null, image_preview: null, order: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="admin-hero-images">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <h1>Hero Images</h1>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Hero Image'}
        </Button>
      </div>

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

      {showForm && (
        <Card style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <CardBody>
            <h2>{editingId ? 'Edit Hero Image' : 'Add New Hero Image'}</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: 'var(--spacing-lg)' }}>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Title (Optional)</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Sunday Service"
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
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1rem'
                  }}
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                  Lower numbers appear first in the slideshow
                </p>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>📤 Upload Image</label>
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

              {formData.image_preview && (
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>Preview</label>
                  <img
                    src={formData.image_preview}
                    alt="Preview"
                    style={{
                      maxWidth: '300px',
                      maxHeight: '200px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <Button variant="primary" type="submit">
                  {editingId ? 'Update' : 'Add'} Hero Image
                </Button>
                <Button variant="secondary" type="button" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
          <Spinner />
        </div>
      ) : heroImages.length > 0 ? (
        <Card>
          <CardBody>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--spacing-lg)'
            }}>
              {heroImages.map((heroImage) => (
                <div
                  key={heroImage.id}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden'
                  }}
                >
                  {heroImage.image_url && (
                    <img
                      src={heroImage.image_url}
                      alt={heroImage.title}
                      style={{
                        width: '100%',
                        height: '180px',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  <div style={{ padding: 'var(--spacing-md)' }}>
                    <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>
                      {heroImage.title || 'Untitled'}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                      Order: {heroImage.order}
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(heroImage)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDelete(heroImage.id)}
                        style={{ color: '#ef4444' }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              No hero images yet. Add your first one!
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
