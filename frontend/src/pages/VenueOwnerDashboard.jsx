import { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Row, Col, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VenueOwnerDashboard = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [venueBookings, setVenueBookings] = useState([]);
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

  const handleViewBookings = async (venueId) => {
      try {
          const res = await axios.get(`/api/bookings/venue/${venueId}`);
          setVenueBookings(res.data.sort((a,b) => new Date(b.startTime) - new Date(a.startTime)));
          setShowBookingsModal(true);
      } catch (err) {
          console.error("Failed to fetch bookings", err);
          alert("Could not fetch bookings.");
      }
  };

  const handleAddVenue = async () => {
    try {
      const venueData = { ...newVenue, ownerId: user.id };
      await axios.post('/api/venues', venueData);
      setShowAddModal(false);
      setNewVenue({ name: '', location: '', description: '', imageUrl: '', courts: [] });
      fetchMyVenues();
      alert('Venue Added Successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to add venue');
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
      if(!tempCourt.name || !tempCourt.pricePerHour) return alert("Please fill court details");
      setNewVenue({ ...newVenue, courts: [...newVenue.courts, tempCourt] });
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
          <h2 className="fw-bold text-light mb-1">Owner Dashboard</h2>
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
        <Alert variant="info" className="bg-dark text-light border-secondary">
          You haven't listed any venues yet. Click "List New Venue" to get started.
        </Alert>
      ) : (
        <Row>
          {venues.map(venue => (
            <Col md={6} lg={4} key={venue.id} className="mb-4">
              <Card className="h-100 bg-dark text-light border-secondary shadow-lg">
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

      {/* Bookings Modal */}
      <Modal show={showBookingsModal} onHide={() => setShowBookingsModal(false)} size="lg" centered className="dark-modal">
        <Modal.Header closeButton className="bg-dark text-light border-secondary">
          <Modal.Title>Venue Bookings</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {venueBookings.length === 0 ? (
            <Alert variant="info" className="bg-dark text-light border-secondary">No bookings found for this venue.</Alert>
          ) : (
             <Table striped bordered hover variant="dark" responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User ID</th>
                        <th>Court ID</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Amt</th>
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
                                {new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                {new Date(b.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </td>
                            <td>
                                <Badge bg={b.status === 'CONFIRMED' ? 'success' : b.status === 'CANCELLED' ? 'danger' : 'warning'}>
                                    {b.status}
                                </Badge>
                            </td>
                            <td>₹{b.amount}</td>
                        </tr>
                    ))}
                </tbody>
             </Table>
          )}
        </Modal.Body>
      </Modal>

      {/* Add Venue Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered className="dark-modal">
        <Modal.Header closeButton className="bg-dark text-light border-secondary">
          <Modal.Title>List New Venue</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Venue Name</Form.Label>
              <Form.Control 
                type="text" 
                className="bg-dark text-light border-secondary"
                value={newVenue.name} 
                onChange={(e) => setNewVenue({...newVenue, name: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control 
                type="text" 
                className="bg-dark text-light border-secondary"
                value={newVenue.location} 
                onChange={(e) => setNewVenue({...newVenue, location: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                className="bg-dark text-light border-secondary"
                value={newVenue.description} 
                onChange={(e) => setNewVenue({...newVenue, description: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control 
                type="text" 
                className="bg-dark text-light border-secondary"
                value={newVenue.imageUrl} 
                onChange={(e) => setNewVenue({...newVenue, imageUrl: e.target.value})}
              />
            </Form.Group>

            <hr className="border-secondary my-4" />
            <h5 className="fw-bold mb-3">Add Courts</h5>
            
            <Row className="g-2 mb-2">
                <Col md={4}>
                    <Form.Control 
                        placeholder="Court Name" 
                        size="sm"
                        className="bg-dark text-light border-secondary"
                        value={tempCourt.name}
                        onChange={(e) => setTempCourt({...tempCourt, name: e.target.value})}
                    />
                </Col>
                <Col md={4}>
                    <Form.Select 
                        size="sm"
                        className="bg-dark text-light border-secondary"
                        value={tempCourt.sportType}
                        onChange={(e) => setTempCourt({...tempCourt, sportType: e.target.value})}
                    >
                        {['Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball', 'Swimming'].map(s => <option key={s} value={s}>{s}</option>)}
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Form.Control 
                        placeholder="Price" 
                        type="number"
                        size="sm"
                        className="bg-dark text-light border-secondary"
                        value={tempCourt.pricePerHour}
                        onChange={(e) => setTempCourt({...tempCourt, pricePerHour: e.target.value})}
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
                            <li key={i} className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between align-items-center py-1 px-0">
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
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Close</Button>
          <Button variant="primary" className="btn-neon" onClick={handleAddVenue}>List Venue</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default VenueOwnerDashboard;
