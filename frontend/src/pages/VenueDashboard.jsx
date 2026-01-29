import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Table, Badge, Nav } from 'react-bootstrap';
import axios from 'axios';

const VenueDashboard = () => {
  const { id } = useParams(); // Venue ID
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Settings State
  const [openTime, setOpenTime] = useState('00:00');
  const [closeTime, setCloseTime] = useState('24:00');
  
  // Blocking State
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [blockDate, setBlockDate] = useState('');
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');

  // Add Court State
  const [newCourt, setNewCourt] = useState({ name: '', sportType: 'Cricket', pricePerHour: '' });

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role !== 'VENUE_OWNER') {
        alert("Access Denied");
        navigate('/');
        return;
    }

    const fetchVenue = async () => {
      try {
        const res = await axios.get(`/api/venues/${id}`);
        setVenue(res.data);
        setOpenTime(res.data.openTime || '00:00');
        setCloseTime(res.data.closeTime || '24:00');

        if (res.data.courts.length > 0) {
            const sports = [...new Set(res.data.courts.map(c => c.sportType))];
            setSelectedSport(sports[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [id]);

  const handleUpdateSettings = async () => {
      try {
          await axios.put(`/api/venues/${id}`, {
              ...venue,
              openTime,
              closeTime
          });
          setMessage('Store timings updated!');
          setTimeout(() => setMessage(''), 3000);
      } catch (err) {
          console.error(err);
          alert('Failed to update.');
      }
  };

  const handleBlockSlot = async () => {
      if(!selectedCourt || !blockDate || !blockStart || !blockEnd) return;
      
      try {
         // Create a "BLOCKED" booking
         // Using the existing booking API but with status BLOCKED
         // Note: You might need to relax backend validation or pass a special flag if standard booking rules apply
         
         const formattedStartTime = `${blockDate}T${blockStart}:00`;
         const formattedEndTime = `${blockDate}T${blockEnd}:00`;

         const bookingData = {
            userId: user.id, // Owner blocks it
            courtId: selectedCourt.id,
            venueId: venue.id,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            amount: 0,
            status: 'BLOCKED'
         };

         await axios.post('/api/bookings', bookingData);
         setMessage('Slot Blocked Successfully!');
         setBlockStart('');
         setBlockEnd('');
         setTimeout(() => setMessage(''), 3000);

      } catch (err) {
          console.error(err);
          const msg = err.response?.data?.message || 'Failed to block slot.';
          alert(msg);
      }
  };

  const handleAddCourt = async () => {
      if(!newCourt.name || !newCourt.pricePerHour) return alert("Please fill all court details");
      try {
          // Send ONLY the new court to avoid duplication in backend list
          await axios.put(`/api/venues/${id}`, {
              courts: [newCourt]
          });
          setNewCourt({ name: '', sportType: 'Cricket', pricePerHour: '' });
          alert('Court Added Successfully!');
          // Refresh venue data
          const res = await axios.get(`/api/venues/${id}`);
          setVenue(res.data);
      } catch (err) {
          console.error(err);
          alert('Failed to add court.');
      }
  };

  const handleDeleteCourt = async (courtId) => {
      if(!window.confirm("Delete this court?")) return;
      try {
          await axios.delete(`/api/venues/courts/${courtId}`);
          alert('Court Deleted');
          const res = await axios.get(`/api/venues/${id}`);
          setVenue(res.data);
      } catch (err) {
          console.error(err);
          alert('Failed to delete court. It may have bookings.');
      }
  };

  if (loading || !venue) return <div className="text-center mt-5 text-white">Loading Dashboard...</div>;

  const filteredCourts = venue.courts.filter(c => c.sportType === selectedSport);

  return (
    <Container fluid className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
            <h1 className="fw-bold text-light">Venue Dashboard</h1>
            <p className="text-muted">Manage {venue.name}</p>
        </div>
        <Button variant="outline-light" onClick={() => navigate(`/venues/${id}`)}>View Public Page</Button>
      </div>

      {message && <Alert variant="success">{message}</Alert>}

      <Row className="g-3 mb-4">
        {/* Col 1: Settings */}
        <Col md={3}>
            <Card className="bg-dark text-light border-secondary shadow h-100">
                <Card.Header className="border-secondary fw-bold">Venue Settings</Card.Header>
                <Card.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Opening Time</Form.Label>
                        <Form.Control type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label>Closing Time</Form.Label>
                        <Form.Control type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} />
                    </Form.Group>
                    <Button variant="primary" className="w-100" onClick={handleUpdateSettings}>Save Settings</Button>
                </Card.Body>
            </Card>
        </Col>

        {/* Col 2: Add Court */}
        <Col md={3}>
            <Card className="bg-dark text-light border-secondary shadow h-100">
                <Card.Header className="border-secondary fw-bold text-success">Add New Court</Card.Header>
                <Card.Body>
                    <Form.Group className="mb-2">
                        <Form.Label>Court Name</Form.Label>
                        <Form.Control type="text" size="sm" value={newCourt.name} onChange={e => setNewCourt({...newCourt, name: e.target.value})} />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Sport</Form.Label>
                        <Form.Select size="sm" value={newCourt.sportType} onChange={e => setNewCourt({...newCourt, sportType: e.target.value})}>
                             {['Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball', 'Swimming'].map(s => <option key={s} value={s}>{s}</option>)}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Price (₹/hr)</Form.Label>
                        <Form.Control type="number" size="sm" value={newCourt.pricePerHour} onChange={e => setNewCourt({...newCourt, pricePerHour: e.target.value})} />
                    </Form.Group>
                    <Button variant="success" size="sm" className="w-100" onClick={handleAddCourt}>Add Court</Button>
                </Card.Body>
            </Card>
        </Col>

        {/* Col 3: Listed Courts */}
        <Col md={6}>
            <Card className="bg-dark text-light border-secondary shadow h-100">
                <Card.Header className="border-secondary fw-bold text-info">Listed Courts</Card.Header>
                <Card.Body className="p-0 overflow-auto" style={{maxHeight: '300px'}}>
                    <ul className="list-group list-group-flush bg-transparent">
                        {venue.courts && venue.courts.map(c => (
                            <li key={c.id} className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="fw-bold">{c.name}</div>
                                    <small className="text-muted">{c.sportType} | ₹{c.pricePerHour}/hr</small>
                                </div>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteCourt(c.id)} title="Delete Court">
                                    <i className="bi bi-trash"></i>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </Card.Body>
            </Card>
        </Col>
      </Row>

      {/* Row 2: Blocking */}
      <Row className="g-3">
        <Col md={12}>
            <Card className="bg-dark text-light border-secondary shadow h-100">
                <Card.Header className="border-secondary fw-bold">Block Slots & Maintenance</Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={3} className="border-end border-secondary">
                             {/* Sport Select */}
                             <div className="d-grid gap-2 mb-3">
                                {[...new Set(venue.courts.map(c => c.sportType))].map(sport => (
                                    <Button 
                                        key={sport} 
                                        variant={selectedSport === sport ? 'info' : 'outline-secondary'}
                                        size="sm"
                                        onClick={() => { setSelectedSport(sport); setSelectedCourt(null); }}
                                    >
                                        {sport}
                                    </Button>
                                ))}
                             </div>
                        </Col>
                        <Col md={9}>
                            <h6 className="text-muted mb-3">Select a Court to Block:</h6>
                            <div className="d-flex flex-wrap gap-2 mb-4">
                                {filteredCourts.map(court => (
                                    <div 
                                        key={court.id}
                                        onClick={() => setSelectedCourt(court)}
                                        className={`p-2 border rounded cursor-pointer ${selectedCourt?.id === court.id ? 'bg-primary text-white border-primary' : 'border-secondary text-muted'}`}
                                        style={{ cursor: 'pointer', minWidth: '100px', textAlign: 'center' }}
                                    >
                                        {court.name}
                                    </div>
                                ))}
                            </div>

                            {selectedCourt && (
                                <div className="p-3 border border-secondary rounded bg-black bg-opacity-25">
                                     <Row className="align-items-end g-2">
                                        <Col md={3}>
                                            <Form.Label>Date</Form.Label>
                                            <Form.Control type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)} />
                                        </Col>
                                        <Col md={3}>
                                            <Form.Label>Start</Form.Label>
                                            <Form.Select value={blockStart} onChange={e => setBlockStart(e.target.value)}>
                                                <option value="">HH:00</option>
                                                {[...Array(24)].map((_, i) => (
                                                    <option key={i} value={`${i.toString().padStart(2,'0')}:00`}>{i}:00</option>
                                                ))}
                                            </Form.Select>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Label>End</Form.Label>
                                            <Form.Select value={blockEnd} onChange={e => setBlockEnd(e.target.value)}>
                                                <option value="">HH:00</option>
                                                {[...Array(24)].map((_, i) => (
                                                    <option key={i} value={`${i.toString().padStart(2,'0')}:00`}>{i}:00</option>
                                                ))}
                                            </Form.Select>
                                        </Col>
                                        <Col md={3}>
                                            <Button variant="danger" className="w-100" onClick={handleBlockSlot}>Block Slot</Button>
                                        </Col>
                                    </Row>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VenueDashboard;
