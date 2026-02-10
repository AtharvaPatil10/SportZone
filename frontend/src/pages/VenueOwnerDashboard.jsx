import { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Row, Col, Card, Badge, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { useTheme } from '../context/ThemeContext';

const VenueOwnerDashboard = () => {
  const { theme } = useTheme();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [venueBookings, setVenueBookings] = useState([]);
  const [bookingsPage, setBookingsPage] = useState(0);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(0);
  const [selectedVenueId, setSelectedVenueId] = useState(null);

  const [showEditBookingModal, setShowEditBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  const [newVenue, setNewVenue] = useState({ name: '', location: '', description: '', imageUrl: '', courts: [] });
  const [tempCourt, setTempCourt] = useState({ name: '', sportType: 'Cricket', pricePerHour: '' });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchMyVenues();
  }, []);

  const fetchMyVenues = async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      const res = await axios.get(`/api/venues/owner/${user.id}`);
      setVenues(res.data);
    } catch (err) {
      console.error("Failed to fetch venues", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenueBookings = async (venueId, page) => {
    try {
      const res = await axios.get(`/api/bookings/venue/${venueId}?page=${page}&size=5`);
      setVenueBookings(res.data.content);
      setBookingsTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
      alert("Could not fetch bookings.");
    }
  };

  const handleViewBookings = async (venueId) => {
    setSelectedVenueId(venueId);
    setBookingsPage(0);
    setShowBookingsModal(true);
    await fetchVenueBookings(venueId, 0);
  };

  const handlePageChange = (newPage) => {
    setBookingsPage(newPage);
    fetchVenueBookings(selectedVenueId, newPage);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await axios.put(`/api/bookings/${bookingId}/cancel`);
      alert("Booking Cancelled");
      fetchVenueBookings(selectedVenueId, bookingsPage);
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking");
    }
  };

  const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setShowEditBookingModal(true);
  };

  const handleSaveBookingEdit = async () => {
    try {
      const { id, ...data } = editingBooking;
      await axios.put(`/api/bookings/${id}`, editingBooking);
      alert("Booking Updated Successfully");
      setShowEditBookingModal(false);
      fetchVenueBookings(selectedVenueId, bookingsPage);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data || "Failed to update booking";
      alert("Update Failed: " + (typeof msg === 'object' ? JSON.stringify(msg) : msg));
    }
  };




  const handleAddVenue = async () => {
    try {
      const venueData = { 
          name: newVenue.name,
          location: newVenue.location,
          description: newVenue.description,
          ownerId: user.id,
          courts: newVenue.courts
      };

      const formData = new FormData();
      formData.append('venue', new Blob([JSON.stringify(venueData)], { type: 'application/json' }));
      
      if (newVenue.imageFiles) {
          for (let i = 0; i < newVenue.imageFiles.length; i++) {
              formData.append('images', newVenue.imageFiles[i]);
          }
      }

      await axios.post('/api/venues', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowAddModal(false);
      setNewVenue({ name: '', location: '', description: '', imageUrl: '', courts: [], imageFiles: [] });
      fetchMyVenues();
      alert('Venue Added Successfully!');
      fetchMyVenues();
      alert('Venue Added Successfully!');
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to add venue";
      alert(`Failed to add venue: ${errorMsg}`);
    }
  };

  const handleDeleteVenue = async (id) => {
    if (!window.confirm("Are you sure you want to delete this venue? This cannot be undone.")) return;
    try {
      await axios.delete(`/api/venues/${id}`);
      setVenues(venues.filter(v => v.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete venue.");
    }
  };

  const addTempCourt = () => {
    if (!tempCourt.name || !tempCourt.pricePerHour) return alert("Please fill court details");
    setNewVenue({ 
        ...newVenue, 
        courts: [...newVenue.courts, { ...tempCourt, pricePerHour: parseFloat(tempCourt.pricePerHour) }] 
    });
    setTempCourt({ name: '', sportType: 'Cricket', pricePerHour: '' });
  };

  const removeTempCourt = (index) => {
    const updated = newVenue.courts.filter((_, i) => i !== index);
    setNewVenue({ ...newVenue, courts: updated });
  };

  if (loading) return <div className="text-center mt-5 text-light">Loading Dashboard...</div>;

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Owner Dashboard</h2>
          <p className="text-muted">Manage your listed venues and courts</p>
        </div>
        <Button
          className="btn-neon fw-bold"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>List New Venue
        </Button>
      </div>

      {venues.length === 0 ? (
        <Alert variant="info" className="border-secondary" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          You haven't listed any venues yet. Click "List New Venue" to get started.
        </Alert>
      ) : (
        <Row>
          {venues.map(venue => (
            <Col md={6} lg={4} key={venue.id} className="mb-4">
              <Card className="h-100 border-secondary shadow-lg" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                <Card.Img
                  variant="top"
                  src={venue.imageUrl || "https://via.placeholder.com/400x200"}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title className="fw-bold">{venue.name}</Card.Title>
                  <Card.Text className="text-muted small mb-2">
                    <i className="bi bi-geo-alt me-1"></i> {venue.location}
                  </Card.Text>
                  <Card.Text>
                    {venue.description?.substring(0, 100)}...
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <Badge bg="primary">{venue.courts ? venue.courts.length : 0} Courts</Badge>
                    <Badge bg={venue.status === 'APPROVED' ? 'success' : 'warning'}>{venue.status || 'PENDING'}</Badge>
                  </div>

                  <div className="d-flex gap-2 mt-3 flex-wrap">
                    <Button variant="outline-warning" size="sm" className="flex-grow-1" onClick={() => navigate(`/venue-dashboard/${venue.id}`)}>
                      <i className="bi bi-gear-fill me-1"></i> Manage
                    </Button>
                    <Button variant="outline-info" size="sm" className="flex-grow-1" onClick={() => handleViewBookings(venue.id)}>
                      <i className="bi bi-calendar-check me-1"></i> Bookings
                    </Button>
                  </div>
                  <div className="d-flex gap-2 mt-2">
                    <Button variant="outline-primary" size="sm" className="flex-grow-1" onClick={() => navigate(`/venues/${venue.id}`)}>
                      View Page
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteVenue(venue.id)} title="Delete Venue">
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showBookingsModal} onHide={() => setShowBookingsModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}>
          <Modal.Title>Venue Bookings</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          {venueBookings.length === 0 ? (
            <Alert variant="info">No bookings found for this venue.</Alert>
          ) : (
            <Table striped bordered hover variant={theme} responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User ID</th>
                  <th>Court ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Amt</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {venueBookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.userId}</td>
                    <td>{b.courtId}</td>
                    <td>{new Date(b.startTime).toLocaleDateString()}</td>
                    <td>
                      {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                      {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <Badge bg={b.status === 'CONFIRMED' ? 'success' : b.status === 'CANCELLED' ? 'danger' : 'warning'}>
                        {b.status}
                      </Badge>
                    </td>
                    <td>₹{b.amount}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button variant="outline-primary" size="sm" onClick={() => handleEditClick(b)} title="Edit Booking">
                          <i className="bi bi-pencil"></i>
                        </Button>
                        {b.status !== 'CANCELLED' && (
                          <Button variant="outline-danger" size="sm" onClick={() => handleCancelBooking(b.id)} title="Cancel Booking">
                            <i className="bi bi-x-lg"></i>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {venueBookings.length > 0 && bookingsTotalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination>
                <Pagination.Prev
                  onClick={() => handlePageChange(Math.max(0, bookingsPage - 1))}
                  disabled={bookingsPage === 0}
                />
                {[...Array(bookingsTotalPages).keys()].map(number => (
                  <Pagination.Item
                    key={number + 1}
                    active={number === bookingsPage}
                    onClick={() => handlePageChange(number)}
                  >
                    {number + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => handlePageChange(Math.min(bookingsTotalPages - 1, bookingsPage + 1))}
                  disabled={bookingsPage === bookingsTotalPages - 1}
                />
              </Pagination>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Booking Modal */}
      <Modal show={showEditBookingModal} onHide={() => setShowEditBookingModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}>
          <Modal.Title>Edit Booking #{editingBooking?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          {editingBooking && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={editingBooking.status}
                  onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value })}
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="BLOCKED">BLOCKED</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={editingBooking.startTime.split('T')[0]}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    const time = editingBooking.startTime.split('T')[1];
                    const endTime = editingBooking.endTime.split('T')[1];
                    setEditingBooking({
                      ...editingBooking,
                      startTime: `${newDate}T${time}`,
                      endTime: `${newDate}T${endTime}`
                    });
                  }}
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  value={editingBooking.startTime.split('T')[1].substring(0, 5)}
                  onChange={(e) => {
                    const date = editingBooking.startTime.split('T')[0];
                    setEditingBooking({ ...editingBooking, startTime: `${date}T${e.target.value}:00` });
                  }}
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  value={editingBooking.endTime.split('T')[1].substring(0, 5)}
                  onChange={(e) => {
                    const date = editingBooking.endTime.split('T')[0];
                    setEditingBooking({ ...editingBooking, endTime: `${date}T${e.target.value}:00` });
                  }}
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Amount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  value={editingBooking.amount}
                  onChange={(e) => setEditingBooking({ ...editingBooking, amount: e.target.value })}
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bs-border-color)' }}>
          <Button variant="secondary" onClick={() => setShowEditBookingModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleSaveBookingEdit}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}>
          <Modal.Title>List New Venue</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Venue Name</Form.Label>
              <Form.Control
                type="text"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}
                value={newVenue.name}
                onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}
                value={newVenue.location}
                onChange={(e) => setNewVenue({ ...newVenue, location: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}
                value={newVenue.description}
                onChange={(e) => setNewVenue({ ...newVenue, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Venue Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}
                onChange={(e) => {
                    const files = Array.from(e.target.files);
                    if(files.length > 5) {
                        alert("You can upload a maximum of 5 images.");
                        e.target.value = "";
                        return;
                    }
                    for(let file of files) {
                        if(file.size > 5 * 1024 * 1024) {
                            alert(`File ${file.name} is too large. Max size is 5MB.`);
                            e.target.value = "";
                            return;
                        }
                    }
                    setNewVenue({ ...newVenue, imageFiles: e.target.files });
                }}
              />
              <Form.Text className="text-muted">
                  Max size: 5MB per image. Accepted formats: JPG, PNG, GIF, etc.
              </Form.Text>
            </Form.Group>

            <hr className="border-secondary my-4" />
            <h5 className="fw-bold mb-3">Add Courts</h5>

            <Row className="g-2 mb-2">
              <Col md={4}>
                <Form.Control
                  placeholder="Court Name"
                  size="sm"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}
                  value={tempCourt.name}
                  onChange={(e) => setTempCourt({ ...tempCourt, name: e.target.value })}
                />
              </Col>
              <Col md={4}>
                <Form.Select
                  size="sm"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}
                  value={tempCourt.sportType}
                  onChange={(e) => setTempCourt({ ...tempCourt, sportType: e.target.value })}
                >
                  {['Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball', 'Swimming'].map(s => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Control
                  placeholder="Price"
                  type="number"
                  size="sm"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}
                  value={tempCourt.pricePerHour}
                  onChange={(e) => setTempCourt({ ...tempCourt, pricePerHour: e.target.value })}
                />
              </Col>
              <Col md={2}>
                <Button size="sm" variant="success" className="w-100" onClick={addTempCourt}>Add</Button>
              </Col>
            </Row>

            {newVenue.courts.length > 0 && (
              <div className="mt-3">
                <h6 className="small text-muted">Added Courts:</h6>
                <ul className="list-group list-group-flush bg-transparent">
                  {newVenue.courts.map((c, i) => (
                    <li key={i} className="list-group-item bg-transparent border-secondary d-flex justify-content-between align-items-center py-1 px-0" style={{ color: 'var(--text-primary)' }}>
                      <small>{c.name} ({c.sportType}) - ₹{c.pricePerHour}</small>
                      <Button variant="link" size="sm" className="text-danger p-0" onClick={() => removeTempCourt(i)}>
                        <i className="bi bi-x-lg"></i>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--bs-border-color)' }}>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Close</Button>
          <Button variant="primary" className="btn-neon" onClick={handleAddVenue}>List Venue</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default VenueOwnerDashboard;
