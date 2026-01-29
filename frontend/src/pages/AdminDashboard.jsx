import { useState, useEffect } from 'react';
import { Container, Table, Alert, Badge, Button, Modal, Form, Row, Col, Card, Pagination } from 'react-bootstrap';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const AdminDashboard = () => {
  const { theme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    status: '',
    amount: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [resUsers, resVenues, resBookings] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/venues/admin/all'),
        axios.get('/api/bookings')
      ]);

      setUsers(resUsers.data);
      setVenues(resVenues.data);

      const upcomingBookings = resBookings.data.filter(b => {
        const isFuture = new Date(b.endTime) > new Date();
        const isNotCancelled = b.status !== 'CANCELLED';
        return isFuture && isNotCancelled;
      });

      // Sort by soonest active booking first
      setBookings(upcomingBookings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await axios.put(`/api/bookings/${id}/cancel`);
        alert('Booking cancelled successfully');
        fetchDashboardData();
      } catch (err) {
        alert('Failed to cancel booking');
      }
    }
  };

  const handleApproveVenue = async (id) => {
    try {
      await axios.put(`/api/venues/${id}/approve`);
      setVenues(venues.map(v => v.id === id ? { ...v, status: 'APPROVED' } : v));
      alert('Venue Approved!');
    } catch (err) {
      console.error("Approve failed", err);
      alert('Failed to approve venue');
    }
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setFormData({
      date: booking.startTime.split('T')[0],
      startTime: booking.startTime.split('T')[1].substring(0, 5),
      endTime: booking.endTime.split('T')[1].substring(0, 5),
      status: booking.status,
      amount: booking.amount
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!selectedBooking) return;

    try {
      const startDateTime = `${formData.date}T${formData.startTime}:00`;
      const endDateTime = `${formData.date}T${formData.endTime}:00`;

      const updatedBooking = {
        ...selectedBooking,
        startTime: startDateTime,
        endTime: endDateTime,
        status: formData.status,
        amount: parseFloat(formData.amount)
      };

      await axios.put(`/api/bookings/${selectedBooking.id}`, updatedBooking);
      alert('Booking updated successfully');
      setShowEditModal(false);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to update booking');
    }
  };

  const [activeTab, setActiveTab] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset search and page when changing tabs
  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, [activeTab]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ... (fetch logic same)

  if (loading) return <div className="text-center mt-5 text-light">Loading Admin Dashboard...</div>;

  // Filter Logic
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVenues = venues.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(b => {
    const venueName = venues.find(v => v.id === b.venueId)?.name || '';
    const userName = users.find(u => u.id === b.userId)?.name || '';
    const searchLower = searchTerm.toLowerCase();

    return (
      venueName.toLowerCase().includes(searchLower) ||
      userName.toLowerCase().includes(searchLower) ||
      b.id.toString().includes(searchLower)
    );
  });

  // Pagination Helper
  const renderPagination = (totalItems) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    let items = [];
    // Show max 5 pages for simple logic, or all if small number. 
    // For simplicity given the requirement, showing all or a simple slice.
    // Let's rely on standard mapping.
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
          {number}
        </Pagination.Item>,
      );
    }

    return (
      <div className="d-flex justify-content-center mt-3">
        <Pagination>
          <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
          {items}
          <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
        </Pagination>
      </div>
    );
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-light">Admin Dashboard</h2>
        <Button variant="outline-light" onClick={fetchDashboardData}><i className="bi bi-arrow-clockwise"></i> Refresh</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* 1. Summary Cards (Clickable) */}
      <Row className="mb-5 g-4">
        <Col md={4}>
          <Card
            className={`border-0 shadow h-100 cursor-pointer ${activeTab === 'USERS' ? 'ring-2 ring-white' : ''}`}
            bg="primary"
            text="white"
            style={{ cursor: 'pointer', transform: activeTab === 'USERS' ? 'scale(1.05)' : 'none', transition: 'all 0.2s' }}
            onClick={() => setActiveTab(activeTab === 'USERS' ? null : 'USERS')}
          >
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="mb-0 opacity-75">All Users</h6>
                <h2 className="fw-bold mb-0">{users.length}</h2>
              </div>
              <i className="bi bi-people-fill fs-1 opacity-50"></i>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card
            className="border-0 shadow h-100"
            bg="success"
            text="white"
            style={{ cursor: 'pointer', transform: activeTab === 'VENUES' ? 'scale(1.05)' : 'none', transition: 'all 0.2s' }}
            onClick={() => setActiveTab(activeTab === 'VENUES' ? null : 'VENUES')}
          >
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="mb-0 opacity-75">Total Venues</h6>
                <h2 className="fw-bold mb-0">{venues.length}</h2>
              </div>
              <i className="bi bi-geo-alt-fill fs-1 opacity-50"></i>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card
            className="border-0 shadow h-100"
            bg="info"
            text="white"
            style={{ cursor: 'pointer', transform: activeTab === 'BOOKINGS' ? 'scale(1.05)' : 'none', transition: 'all 0.2s' }}
            onClick={() => setActiveTab(activeTab === 'BOOKINGS' ? null : 'BOOKINGS')}
          >
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="mb-0 opacity-75">Upcoming Bookings</h6>
                <h2 className="fw-bold mb-0">{bookings.length}</h2>
              </div>
              <i className="bi bi-calendar-check-fill fs-1 opacity-50"></i>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 2. Conditional Details Section */}
      {activeTab === 'USERS' && (
        <div className="mb-5 fade-in">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary pb-2">
            <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>All Users Management</h4>
            <Form.Control
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-secondary"
              style={{ maxWidth: '300px', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
            />
          </div>
          <Card className="border-secondary shadow" style={{ backgroundColor: 'var(--bg-card)' }}>
            <Table variant={theme} bordered hover responsive className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Change Role</th>
                  <th>Venues Owned</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(user => {
                  const ownedVenues = venues.filter(v => v.ownerId === user.id);
                  return (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg={user.role === 'ADMIN' ? 'danger' : user.role === 'VENUE_OWNER' ? 'info' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={user.role}
                          onChange={async (e) => {
                            const newRole = e.target.value;
                            if (window.confirm(`Change role of ${user.name} to ${newRole}?`)) {
                              try {
                                await axios.put(`/api/users/${user.id}`, { role: newRole });
                                fetchDashboardData();
                              } catch (err) {
                                alert('Failed to update role');
                              }
                            } else {
                              fetchDashboardData();
                            }
                          }}
                          className="border-secondary"
                          style={{ width: '150px', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                        >
                          <option value="USER">USER</option>
                          <option value="VENUE_OWNER">VENUE_OWNER</option>
                          <option value="ADMIN">ADMIN</option>
                        </Form.Select>
                      </td>
                      <td>
                        {ownedVenues.length > 0 ? (
                          ownedVenues.map(v => <Badge key={v.id} bg="secondary" className="me-1">{v.name}</Badge>)
                        ) : (
                          <span className="text-secondary small">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && <tr><td colSpan="6" className="text-center">No Users found matching "{searchTerm}".</td></tr>}
              </tbody>
            </Table>
          </Card>
          {renderPagination(filteredUsers.length)}
        </div>
      )}

      {activeTab === 'VENUES' && (
        <div className="mb-5 fade-in">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary pb-2">
            <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>All Venues List</h4>
            <Form.Control
              type="text"
              placeholder="Search venues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-secondary"
              style={{ maxWidth: '300px', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
            />
          </div>
          <Card className="border-secondary shadow" style={{ backgroundColor: 'var(--bg-card)' }}>
            <Table variant={theme} bordered hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Venue Name</th>
                  <th>Location</th>
                  <th>Owner ID</th>
                  <th>Status</th>
                  <th>Courts</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVenues.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(venue => (
                  <tr key={venue.id}>
                    <td>{venue.id}</td>
                    <td>{venue.name}</td>
                    <td>{venue.location}</td>
                    <td>{venue.ownerId}</td>
                    <td>
                      <Badge bg={venue.status === 'APPROVED' ? 'success' : 'warning'}>
                        {venue.status || 'PENDING'}
                      </Badge>
                    </td>
                    <td>{venue.courts ? venue.courts.length : 0}</td>
                    <td>
                      {(!venue.status || venue.status === 'PENDING') && (
                        <Button variant="success" size="sm" onClick={() => handleApproveVenue(venue.id)}>
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredVenues.length === 0 && <tr><td colSpan="5" className="text-center">No Venues found matching "{searchTerm}".</td></tr>}
              </tbody>
            </Table>
          </Card>
          {renderPagination(filteredVenues.length)}
        </div>
      )}

      {activeTab === 'BOOKINGS' && (
        <div className="fade-in">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary pb-2">
            <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Upcoming Bookings ({filteredBookings.length})</h4>
            <Form.Control
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-secondary"
              style={{ maxWidth: '300px', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
            />
          </div>
          <Card className="border-secondary shadow overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
            <Table variant={theme} striped bordered hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Venue</th>
                  <th>Court</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{venues.find(v => v.id === booking.venueId)?.name || booking.venueId}</td>
                    <td>{booking.courtId}</td>
                    <td>{users.find(u => u.id === booking.userId)?.name || booking.userId}</td>
                    <td>{booking.startTime.split('T')[0]}</td>
                    <td>{booking.startTime.split('T')[1].substring(0, 5)} - {booking.endTime.split('T')[1].substring(0, 5)}</td>
                    <td>₹{booking.amount}</td>
                    <td>
                      <Badge bg={booking.status === 'CONFIRMED' ? 'success' : booking.status === 'CANCELLED' ? 'danger' : 'warning'}>
                        {booking.status}
                      </Badge>
                    </td>
                    <td>
                      <Button variant="primary" size="sm" className="me-2" onClick={() => handleEdit(booking)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => handleCancel(booking.id)}>Cancel</Button>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && <tr><td colSpan="9" className="text-center">No Bookings found matching "{searchTerm}".</td></tr>}
              </tbody>
            </Table>
          </Card>
          {renderPagination(filteredBookings.length)}
        </div>
      )}

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton className="border-secondary" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <Modal.Title>Edit Booking #{selectedBooking?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <Form>
            <Row className="mb-3">
              <Col>
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="border-secondary"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                />
              </Col>
              <Col>
                <Form.Label>Amount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="border-secondary"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="border-secondary"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                />
              </Col>
              <Col>
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="border-secondary"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
                />
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="border-secondary"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)' }}
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="BLOCKED">BLOCKED</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-secondary" style={{ backgroundColor: 'var(--bg-card)' }}>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleSave}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
