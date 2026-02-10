import { useState, useEffect } from 'react';
import { Container, Table, Alert, Badge, Button, Modal, Form, Row, Col, Card, Pagination } from 'react-bootstrap';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const AdminDashboard = () => {
  const { theme } = useTheme();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    status: '',
    amount: ''
  });

  const [users, setUsers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [usersPage, setUsersPage] = useState(0);
  const [venuesPage, setVenuesPage] = useState(0);
  const [bookingsPage, setBookingsPage] = useState(0);

  const [totalPagesUsers, setTotalPagesUsers] = useState(0);
  const [totalPagesVenues, setTotalPagesVenues] = useState(0);
  const [totalPagesBookings, setTotalPagesBookings] = useState(0);

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalVenues, setTotalVenues] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);

  const [activeTab, setActiveTab] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDashboardData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [activeTab, usersPage, venuesPage, bookingsPage, searchTerm]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwtToken');
      const headers = { Authorization: `Bearer ${token}` };

      const searchParam = searchTerm ? `&search=${searchTerm}` : '';

      const userSearch = activeTab === 'USERS' ? searchParam : '';
      const venueSearch = activeTab === 'VENUES' ? searchParam : '';

      const usersRes = await axios.get(`/api/users?page=${usersPage}&size=10${userSearch}`, { headers });
      const venuesRes = await axios.get(`/api/venues/admin/all?page=${venuesPage}&size=10${venueSearch}`, { headers });
      const bookingsRes = await axios.get(`/api/bookings?page=${bookingsPage}&size=10&upcoming=true`, { headers });

      setUsers(usersRes.data.content);
      setTotalPagesUsers(usersRes.data.totalPages);
      setTotalUsers(usersRes.data.totalElements);

      setVenues(venuesRes.data.content);
      setTotalPagesVenues(venuesRes.data.totalPages);
      setTotalVenues(venuesRes.data.totalElements);

      setBookings(bookingsRes.data.content);
      setTotalPagesBookings(bookingsRes.data.totalPages);
      setTotalBookings(bookingsRes.data.totalElements);

    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const token = localStorage.getItem('jwtToken');
        await axios.put(`/api/bookings/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
        alert('Booking cancelled successfully');
        fetchDashboardData();
      } catch (err) {
        alert('Failed to cancel booking');
      }
    }
  };

  const handleApproveVenue = async (id) => {
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.put(`/api/venues/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
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

      const token = localStorage.getItem('jwtToken');
      await axios.put(`/api/bookings/${selectedBooking.id}`, updatedBooking, { headers: { Authorization: `Bearer ${token}` } });
      alert('Booking updated successfully');
      setShowEditModal(false);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to update booking');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (!window.confirm(`Change role to ${newRole}?`)) return;
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.put(`/api/users/${userId}`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Role updated');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to update role');
    }
  };

  if (loading && users.length === 0) return <div className="text-center mt-5 text-light">Loading Admin Dashboard...</div>;

  const filteredBookings = bookings.filter(b => {
    const venueName = venues.find(v => v.id === b.venueId)?.name || '';
    const userName = users.find(u => u.id === b.userId)?.name || '';
    const searchLower = searchTerm.toLowerCase();

    if (activeTab !== 'BOOKINGS') return true;

    return (
      venueName.toLowerCase().includes(searchLower) ||
      userName.toLowerCase().includes(searchLower) ||
      b.id.toString().includes(searchLower)
    );
  });

  const renderPagination = (totalPages, currentPage, setPage) => {
    if (totalPages <= 1) return null;

    let items = [];
    const displayPage = currentPage + 1;

    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item key={number} active={number === displayPage} onClick={() => setPage(number - 1)}>
          {number}
        </Pagination.Item>,
      );
    }

    return (
      <div className="d-flex justify-content-center mt-3">
        <Pagination>
          <Pagination.Prev onClick={() => setPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} />
          {items}
          <Pagination.Next onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage === totalPages - 1} />
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
                <h2 className="fw-bold mb-0">{totalUsers}</h2>
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
                <h2 className="fw-bold mb-0">{totalVenues}</h2>
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
                <h2 className="fw-bold mb-0">{totalBookings}</h2>
              </div>
              <i className="bi bi-calendar-check-fill fs-1 opacity-50"></i>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
                {users.map(user => {
                  const ownedVenues = venues.filter(v => v.ownerId === user.id); // This might be empty if venues not loaded, but good enough for now
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
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
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
                {users.length === 0 && <tr><td colSpan="6" className="text-center">No Users found.</td></tr>}
              </tbody>
            </Table>
          </Card>
          {renderPagination(totalPagesUsers, usersPage, setUsersPage)}
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
                {venues.map(venue => (
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
                {venues.length === 0 && <tr><td colSpan="7" className="text-center">No Venues found.</td></tr>}
              </tbody>
            </Table>
          </Card>
          {renderPagination(totalPagesVenues, venuesPage, setVenuesPage)}
        </div>
      )}

      {activeTab === 'BOOKINGS' && (
        <div className="fade-in">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary pb-2">
            <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Upcoming Bookings ({totalBookings})</h4>
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
                  <th>User</th>
                  <th>Venue</th>
                  <th>Court</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => {
                  const venueName = venues.find(v => v.id === booking.venueId)?.name || 'ID: ' + booking.venueId;
                  const userName = users.find(u => u.id === booking.userId)?.name || 'ID: ' + booking.userId;
                  return (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{userName}</td>
                      <td>{venueName}</td>
                      <td>{booking.courtId}</td>
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
                  );
                })}
                {filteredBookings.length === 0 && <tr><td colSpan="9" className="text-center">No Bookings found matching "{searchTerm}".</td></tr>}
              </tbody>
            </Table>
          </Card>
          {renderPagination(totalPagesBookings, bookingsPage, setBookingsPage)}
        </div>
      )}

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
