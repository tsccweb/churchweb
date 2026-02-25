import React, { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardBody, Badge } from '@/components/shared';
import API from '@/services/api';

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ total_donated: 0, donation_count: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    searchTerm: '',
    dateFrom: '',
    dateTo: '',
  });
  
  // Modal states
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [showExportingMessage, setShowExportingMessage] = useState(false);

  // Fetch donations
  const fetchDonations = async (page = 1) => {
    setLoading(true);
    try {
      const response = await API.get(`/admin/donations?page=${page}&limit=${pageSize}`);
      
      // Filter donations based on search filters
      let filtered = response.data || [];
      
      if (filters.status) {
        filtered = filtered.filter(d => d.status === filters.status);
      }
      if (filters.paymentMethod) {
        filtered = filtered.filter(d => d.payment_method === filters.paymentMethod);
      }
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(d => 
          d.donor_name.toLowerCase().includes(search) ||
          d.donor_email.toLowerCase().includes(search)
        );
      }
      
      setDonations(filtered);
      setCurrentPage(page);
      setTotalPages(Math.ceil(filtered.length / pageSize));
    } catch (err) {
      console.error('Error fetching donations:', err);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await API.get('/donations/stats');
      const allDonations = await API.get('/admin/donations?limit=1000');
      
      setStats(response);
      
      // Calculate additional stats
      if (allDonations.data) {
        const completed = allDonations.data.filter(d => d.status === 'completed');
        const pending = allDonations.data.filter(d => d.status === 'pending');
        const failed = allDonations.data.filter(d => d.status === 'failed');
        
        setStats(prev => ({
          ...prev,
          completed_count: completed.length,
          pending_count: pending.length,
          failed_count: failed.length,
          average_donation: completed.length > 0 
            ? (completed.reduce((sum, d) => sum + parseFloat(d.amount), 0) / completed.length).toFixed(2)
            : 0,
        }));
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchDonations(1);
    fetchStats();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStatusChange = async (donationId, newStatus) => {
    try {
      await API.put(`/admin/donations/${donationId}`, { status: newStatus });
      setEditingStatus(null);
      setShowModal(false);
      fetchDonations(currentPage);
      fetchStats();
    } catch (err) {
      console.error('Error updating donation:', err);
    }
  };

  const handleExport = async () => {
    setShowExportingMessage(true);
    try {
      const response = await API.get('/admin/donations/export');
      
      // Create download link
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting donations:', err);
    } finally {
      setShowExportingMessage(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#22c55e';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'stripe': return '💳';
      case 'paypal': return '🅿️';
      case 'gcash': return '📱';
      default: return '💰';
    }
  };

  const displayDonations = donations.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="donations-admin" style={{ padding: 'var(--spacing-lg)' }}>
      <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Donations Management</h1>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-2xl)',
      }}>
        <Card>
          <CardBody style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Total Donated
            </p>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: 0 }}>
              ${typeof stats.total_donated === 'number' ? stats.total_donated.toFixed(2) : '0.00'}
            </h3>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Total Donations
            </p>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: 0 }}>
              {stats.donation_count || 0}
            </h3>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Average Donation
            </p>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: 0 }}>
              ${stats.average_donation || '0.00'}
            </h3>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Completed
            </p>
            <h3 style={{ color: '#22c55e', marginBottom: 0 }}>
              {stats.completed_count || 0}
            </h3>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Pending
            </p>
            <h3 style={{ color: '#f59e0b', marginBottom: 0 }}>
              {stats.pending_count || 0}
            </h3>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Failed
            </p>
            <h3 style={{ color: '#ef4444', marginBottom: 0 }}>
              {stats.failed_count || 0}
            </h3>
          </CardBody>
        </Card>
      </div>

      {/* Filters & Controls */}
      <Card style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <CardHeader>
          <h3>Filters & Search</h3>
        </CardHeader>
        <CardBody>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-lg)',
          }}>
            {/* Search */}
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>
                Search Donor
              </label>
              <input
                type="text"
                placeholder="Name or email..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>
                Payment Method
              </label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <option value="">All Methods</option>
                <option value="stripe">💳 Card (Stripe)</option>
                <option value="paypal">🅿️ PayPal</option>
                <option value="gcash">📱 GCash</option>
              </select>
            </div>

            {/* Page Size */}
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontWeight: '600' }}>
                Rows Per Page
              </label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          {/* Export Button */}
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={showExportingMessage || donations.length === 0}
            style={{ width: '100%' }}
          >
            {showExportingMessage ? '📥 Exporting...' : '📥 Export as CSV'}
          </Button>
        </CardBody>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <h3>
            Donations {displayDonations.length > 0 && `(${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, donations.length)} of ${donations.length})`}
          </h3>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-secondary)' }}>
              Loading donations...
            </div>
          ) : displayDonations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-secondary)' }}>
              No donations found
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.95rem',
                }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                      <th style={{ textAlign: 'left', padding: 'var(--spacing-md)', fontWeight: '600' }}>Donor</th>
                      <th style={{ textAlign: 'left', padding: 'var(--spacing-md)', fontWeight: '600' }}>Email</th>
                      <th style={{ textAlign: 'center', padding: 'var(--spacing-md)', fontWeight: '600' }}>Amount</th>
                      <th style={{ textAlign: 'center', padding: 'var(--spacing-md)', fontWeight: '600' }}>Method</th>
                      <th style={{ textAlign: 'center', padding: 'var(--spacing-md)', fontWeight: '600' }}>Status</th>
                      <th style={{ textAlign: 'center', padding: 'var(--spacing-md)', fontWeight: '600' }}>Date</th>
                      <th style={{ textAlign: 'center', padding: 'var(--spacing-md)', fontWeight: '600' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayDonations.map((donation) => (
                      <tr
                        key={donation.id}
                        style={{
                          borderBottom: '1px solid var(--color-border)',
                          ':hover': { backgroundColor: 'var(--color-background-secondary)' },
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: 'var(--spacing-md)' }}>
                          <strong>{donation.donor_name}</strong>
                        </td>
                        <td style={{ padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                          {donation.donor_email}
                        </td>
                        <td style={{ padding: 'var(--spacing-md)', textAlign: 'center', fontWeight: '600' }}>
                          ${parseFloat(donation.amount).toFixed(2)}
                        </td>
                        <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                          <span title={donation.payment_method}>
                            {getPaymentMethodIcon(donation.payment_method)}
                          </span>
                        </td>
                        <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: `${getStatusColor(donation.status)}20`,
                              color: getStatusColor(donation.status),
                              fontWeight: '600',
                              fontSize: '0.85rem',
                              textTransform: 'capitalize',
                            }}
                          >
                            {donation.status}
                          </span>
                        </td>
                        <td style={{ padding: 'var(--spacing-md)', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                          {new Date(donation.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedDonation(donation);
                              setEditingStatus(donation.status);
                              setShowModal(true);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 'var(--spacing-md)',
                  marginTop: 'var(--spacing-lg)',
                  paddingTop: 'var(--spacing-lg)',
                  borderTop: '1px solid var(--color-border)',
                }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fetchDonations(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </Button>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => fetchDonations(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fetchDonations(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </Button>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Donation Detail Modal */}
      {showModal && selectedDonation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowModal(false)}>
          <Card style={{
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
          }} onClick={(e) => e.stopPropagation()}>
            <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Donation Details</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                }}
              >
                ✕
              </button>
            </CardHeader>
            <CardBody style={{ paddingBottom: 'var(--spacing-2xl)' }}>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Donor Name</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{selectedDonation.donor_name}</p>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Email</p>
                <p style={{ fontSize: '0.95rem' }}>
                  <a href={`mailto:${selectedDonation.donor_email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                    {selectedDonation.donor_email}
                  </a>
                </p>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Amount</p>
                <p style={{ fontSize: '1.3rem', fontWeight: '600', color: 'var(--color-primary)' }}>
                  ${parseFloat(selectedDonation.amount).toFixed(2)}
                </p>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Currency</p>
                <p style={{ fontSize: '0.95rem' }}>{selectedDonation.currency}</p>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Payment Method</p>
                <p style={{ fontSize: '0.95rem' }}>
                  {getPaymentMethodIcon(selectedDonation.payment_method)} {selectedDonation.payment_method || 'Unknown'}
                </p>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Status</p>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: `${getStatusColor(selectedDonation.status)}20`,
                      color: getStatusColor(selectedDonation.status),
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}
                  >
                    {selectedDonation.status}
                  </span>
                </div>
                
                {/* Status Update Dropdown */}
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '0.9rem' }}>
                    Update Status
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <select
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value)}
                      style={{
                        flex: 1,
                        padding: 'var(--spacing-sm)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                    <Button
                      variant="primary"
                      onClick={() => handleStatusChange(selectedDonation.id, editingStatus)}
                      disabled={editingStatus === selectedDonation.status}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Donation ID</p>
                <p style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                  {selectedDonation.id}
                </p>
              </div>

              <div style={{ marginBottom: 0 }}>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>Date Created</p>
                <p style={{ fontSize: '0.95rem' }}>
                  {new Date(selectedDonation.created_at).toLocaleString()}
                </p>
              </div>

              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                style={{ width: '100%', marginTop: 'var(--spacing-lg)' }}
              >
                Close
              </Button>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

