import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Badge, Spinner } from '@/components/shared';
import API from '@/services/api';

export default function AdminGallery() {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSection, setSelectedSection] = useState('welcome');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    image: null,
    imagePreview: '',
    title: '',
    order: 0,
  });

  const sections = [
    { value: 'welcome', label: 'Welcome Section' },
  ];

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/gallery');
      setGallery(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: event.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      setError('Please select an image');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('image', formData.image);
      data.append('title', formData.title);
      data.append('section', selectedSection);
      data.append('order', formData.order);

      await API.post('/admin/gallery', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Gallery image uploaded successfully!');
      setFormData({ image: null, imagePreview: '', title: '', order: 0 });
      setShowForm(false);
      await fetchGallery();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      setLoading(true);
      await API.delete(`/admin/gallery/${id}`);
      setSuccess('Gallery image deleted successfully!');
      await fetchGallery();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  const filteredGallery = gallery.filter((item) => item.section === selectedSection);

  return (
    <div className="admin-gallery">
      <style>{`
        .admin-gallery {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .gallery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .gallery-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }
        .gallery-form {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid var(--color-border);
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--color-text);
        }
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 1rem;
          background: var(--color-background);
          color: var(--color-text);
        }
        .file-input-wrapper {
          position: relative;
          display: inline-block;
          width: 100%;
        }
        .file-input-wrapper input[type="file"] {
          display: none;
        }
        .file-input-label {
          display: block;
          padding: 1rem;
          background: var(--color-background-secondary);
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-md);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .file-input-label:hover {
          border-color: var(--color-primary);
          background: var(--color-background);
        }
        .image-preview {
          width: 100%;
          max-width: 400px;
          border-radius: var(--radius-lg);
          margin-top: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .form-buttons {
          display: flex;
          gap: 1rem;
        }
        .alert {
          padding: 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
        }
        .alert-error {
          background: #fee;
          color: #c33;
          border: 1px solid #fcc;
        }
        .alert-success {
          background: #efe;
          color: #3c3;
          border: 1px solid #cfc;
        }
        .section-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .section-tab {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: var(--radius-md);
          background: var(--color-background-secondary);
          color: var(--color-text);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .section-tab.active {
          background: var(--color-primary);
          color: white;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .gallery-card {
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        .gallery-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
        .gallery-card-image {
          width: 100%;
          height: 180px;
          background: var(--color-background-secondary);
          object-fit: cover;
        }
        .gallery-card-body {
          padding: 1rem;
          background: var(--color-surface);
        }
        .gallery-card-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--color-text);
        }
        .gallery-card-order {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin-bottom: 1rem;
        }
        .gallery-card-actions {
          display: flex;
          gap: 0.5rem;
        }
        .gallery-card-actions button {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }
        .btn-delete {
          background: #fee;
          color: #c33;
        }
        .btn-delete:hover {
          background: #fcc;
        }
      `}</style>

      <div className="gallery-header">
        <h1>Gallery Manager</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? 'secondary' : 'primary'}
        >
          {showForm ? 'Cancel' : '+ Add Image'}
        </Button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="section-tabs">
        {sections.map((section) => (
          <button
            key={section.value}
            className={`section-tab ${selectedSection === section.value ? 'active' : ''}`}
            onClick={() => setSelectedSection(section.value)}
          >
            {section.label}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="gallery-form">
          <div className="form-group">
            <label>Upload Image</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="imageInput"
                accept="image/*"
                onChange={handleImageSelect}
              />
              <label htmlFor="imageInput" className="file-input-label">
                Click or drag to upload image
              </label>
            </div>
            {formData.imagePreview && (
              <img src={formData.imagePreview} alt="Preview" className="image-preview" />
            )}
          </div>

          <div className="form-group">
            <label>Title (Optional)</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Image title"
            />
          </div>

          <div className="form-group">
            <label>Display Order</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-buttons">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Spinner />
        </div>
      ) : filteredGallery.length > 0 ? (
        <div className="gallery-grid">
          {filteredGallery.map((item) => (
            <div key={item.id} className="gallery-card">
              <img
                src={item.image_url}
                alt={item.title || 'Gallery image'}
                className="gallery-card-image"
              />
              <div className="gallery-card-body">
                {item.title && <div className="gallery-card-title">{item.title}</div>}
                <div className="gallery-card-order">Order: {item.order}</div>
                <div className="gallery-card-actions">
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(item.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
          No images uploaded for this section yet.
        </div>
      )}
    </div>
  );
}
