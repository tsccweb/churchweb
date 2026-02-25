/**
 * API Service Layer
 * Central abstraction for all API requests
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE = `${API_URL}/api/v1`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData - let axios handle it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  logout: () =>
    api.post('/auth/logout'),
  me: () =>
    api.get('/auth/me'),
  updateProfile: (data) =>
    api.put('/auth/profile', data),
};

// Events API
export const eventsAPI = {
  getAll: (page = 1, limit = 10) =>
    api.get(`/events?page=${page}&limit=${limit}`),
  getUpcoming: () =>
    api.get('/events?status=upcoming'),
  getFeatured: () =>
    api.get('/events?featured=true'),
  getById: (id) =>
    api.get(`/events/${id}`),
  create: (data) =>
    api.post('/admin/events', data),
  update: (id, data) =>
    api.put(`/admin/events/${id}`, data),
  delete: (id) =>
    api.delete(`/admin/events/${id}`),
};

// Ministries API
export const ministriesAPI = {
  list: (page = 1, limit = 10, category = null) =>
    api.get(`/ministries?page=${page}&limit=${limit}${category ? `&category=${category}` : ''}`),
  getByCategory: (categoryId) =>
    api.get(`/ministries/category/${categoryId}`),
  search: (query) =>
    api.get(`/ministries/search?q=${query}`),
  get: (id) =>
    api.get(`/ministries/${id}`),
  getCategories: () =>
    api.get('/ministries/categories'),
  create: (data) =>
    api.post('/admin/ministries', data),
  update: (id, data) =>
    api.put(`/admin/ministries/${id}`, data),
  delete: (id) =>
    api.delete(`/admin/ministries/${id}`),
};

// Donations API
export const donationsAPI = {
  create: (data) =>
    api.post('/donations', data),
  createPaymentIntent: (amount) =>
    api.post('/donations/payment-intent', { amount }),
  getPublicStats: () =>
    api.get('/donations/stats'),
  // Admin endpoints
  getAll: (page = 1) =>
    api.get(`/admin/donations?page=${page}`),
  getStats: () =>
    api.get('/admin/donations/stats'),
  exportCSV: () =>
    api.get('/admin/donations/export', { responseType: 'blob' }),
};

// Contact API
export const contactAPI = {
  submit: (data) =>
    api.post('/contact', data),
  // Admin
  getAll: (page = 1) =>
    api.get(`/admin/contact-messages?page=${page}`),
  markAsRead: (id) =>
    api.put(`/admin/contact-messages/${id}/read`),
  reply: (id, reply) =>
    api.post(`/admin/contact-messages/${id}/reply`, { reply }),
  delete: (id) =>
    api.delete(`/admin/contact-messages/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getAnalytics: () =>
    api.get('/admin/dashboard/analytics'),
  getDonationStats: () =>
    api.get('/admin/dashboard/donations'),
  getEventStats: () =>
    api.get('/admin/dashboard/events'),
  getMinistryStats: () =>
    api.get('/admin/dashboard/ministries'),
};
