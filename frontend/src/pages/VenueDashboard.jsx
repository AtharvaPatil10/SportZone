import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Table, Badge, Nav } from 'react-bootstrap';
import axios from 'axios';

import { useTheme } from '../context/ThemeContext';

const VenueDashboard = () => {
    const { theme } = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    const [venue, setVenue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const [openTime, setOpenTime] = useState('00:00');
    const [closeTime, setCloseTime] = useState('24:00');

    const [selectedSport, setSelectedSport] = useState('');
    const [selectedCourt, setSelectedCourt] = useState(null);
    const [blockDate, setBlockDate] = useState('');
    const [blockStart, setBlockStart] = useState('');
    const [blockEnd, setBlockEnd] = useState('');

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


    const handleUploadImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large.");
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            await axios.post(`/api/venues/${id}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Image Uploaded!');
            const res = await axios.get(`/api/venues/${id}`);
            setVenue(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to upload image.');
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm("Delete this image?")) return;
        try {
            await axios.delete(`/api/venues/images/${imageId}`);
            alert('Image Deleted');
             const res = await axios.get(`/api/venues/${id}`);
             setVenue(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to delete image.');
        }
    };

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
        if (!selectedCourt || !blockDate || !blockStart || !blockEnd) return;

        try {
            const formattedStartTime = `${blockDate}T${blockStart}:00`;

            const startH = parseInt(blockStart.split(':')[0]);
            const endH = parseInt(blockEnd.split(':')[0]);

            let endDateStr = blockDate;
            if (endH <= startH) {
                const d = new Date(blockDate);
                d.setDate(d.getDate() + 1);
                endDateStr = d.toISOString().split('T')[0];
            }

            const formattedEndTime = `${endDateStr}T${blockEnd}:00`;

            const bookingData = {
                userId: user.id,
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
            console.error("Block Slot Error Details:", err);
            let msg = 'Failed to block slot.';
            if (err.response?.data?.errors) {
                msg = "Validation Failed: " + JSON.stringify(err.response.data.errors);
            } else if (err.response?.data?.message) {
                msg = err.response.data.message;
            } else if (typeof err.response?.data === 'string') {
                msg = err.response.data;
            }
            alert(msg);
        }
    };

    const handleAddCourt = async () => {
        if (!newCourt.name || !newCourt.pricePerHour) return alert("Please fill all court details");
        try {

            await axios.put(`/api/venues/${id}`, {
                ...venue,
                courts: [newCourt]
            });
            setNewCourt({ name: '', sportType: 'Cricket', pricePerHour: '' });
            alert('Court Added Successfully!');

            const res = await axios.get(`/api/venues/${id}`);
            setVenue(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to add court.');
        }
    };

    const handleDeleteCourt = async (courtId) => {
        if (!window.confirm("Delete this court?")) return;
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

    if (loading || !venue) return <div className="text-center mt-5" style={{ color: 'var(--text-primary)' }}>Loading Dashboard...</div>;

    const filteredCourts = venue.courts.filter(c => c.sportType === selectedSport);

    return (
        <Container fluid className="py-3">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Venue Dashboard</h1>
                    <p className="text-muted">Manage {venue.name}</p>
                </div>
                <Button variant={theme === 'dark' ? 'outline-light' : 'outline-primary'} onClick={() => navigate(`/venues/${id}`)}>View Public Page</Button>
            </div>

            {message && <Alert variant="success">{message}</Alert>}

            <Row className="g-3 mb-4">

                <Col md={3}>
                    <Card className="border-secondary shadow h-100" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                        <Card.Header className="border-secondary fw-bold">Venue Settings</Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Opening Time</Form.Label>
                                <Form.Control type="time" value={openTime} onChange={e => setOpenTime(e.target.value)}
                                    style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-unique)', borderColor: 'var(--bs-border-color)' }} />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label>Closing Time</Form.Label>
                                <Form.Control type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)}
                                    style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-unique)', borderColor: 'var(--bs-border-color)' }} />
                            </Form.Group>
                            <Button variant="primary" className="w-100 mb-3" onClick={handleUpdateSettings}>Save Settings</Button>
                            
                            <hr className="border-secondary" />
                            <h6 className="fw-bold">Gallery</h6>
                             <div className="d-flex flex-wrap gap-2 mb-2">
                                {venue.images && venue.images.map(img => (
                                    <div key={img.id} className="position-relative">
                                        <img src={img.imageUrl} alt="Venue" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                        <Button 
                                            size="sm" 
                                            variant="danger" 
                                            className="position-absolute top-0 start-100 translate-middle p-0 rounded-circle"
                                            style={{ width: '20px', height: '20px', fontSize: '10px', lineHeight: 1 }}
                                            onClick={() => handleDeleteImage(img.id)}
                                        >
                                            <i className="bi bi-x"></i>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Form.Group>
                                <Form.Label className="small">Add Image</Form.Label>
                                <Form.Control 
                                    type="file" 
                                    size="sm" 
                                    accept="image/*" 
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            if (file.size > 5 * 1024 * 1024) {
                                                alert("File is too large. Max size is 5MB.");
                                                e.target.value = "";
                                                return;
                                            }
                                            handleUploadImage(e);
                                        }
                                    }}
                                    style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }} 
                                />
                                <Form.Text className="text-muted d-block mt-1">
                                    Max size: 5MB
                                </Form.Text>
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3}>
                    <Card className="border-secondary shadow h-100" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                        <Card.Header className="border-secondary fw-bold text-success">Add New Court</Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-2">
                                <Form.Label>Court Name</Form.Label>
                                <Form.Control type="text" size="sm" value={newCourt.name} onChange={e => setNewCourt({ ...newCourt, name: e.target.value })}
                                    style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }} />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Sport</Form.Label>
                                <Form.Select size="sm" value={newCourt.sportType} onChange={e => setNewCourt({ ...newCourt, sportType: e.target.value })}
                                    style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}>
                                    {['Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball', 'Swimming'].map(s => <option key={s} value={s}>{s}</option>)}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Price (₹/hr)</Form.Label>
                                <Form.Control type="number" size="sm" value={newCourt.pricePerHour} onChange={e => setNewCourt({ ...newCourt, pricePerHour: e.target.value })}
                                    style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }} />
                            </Form.Group>
                            <Button variant="success" size="sm" className="w-100" onClick={handleAddCourt}>Add Court</Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="border-secondary shadow h-100" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                        <Card.Header className="border-secondary fw-bold text-info">Listed Courts</Card.Header>
                        <Card.Body className="p-0 overflow-auto" style={{ maxHeight: '300px' }}>
                            <ul className="list-group list-group-flush bg-transparent">
                                {venue.courts && venue.courts.map(c => (
                                    <li key={c.id} className="list-group-item bg-transparent border-secondary d-flex justify-content-between align-items-center" style={{ color: 'var(--text-primary)' }}>
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

            <Row className="g-3">
                <Col md={12}>
                    <Card className="border-secondary shadow h-100" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                        <Card.Header className="border-secondary fw-bold">Block Slots & Maintenance</Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={3} className="border-end border-secondary">

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
                                        <div className="p-3 border border-secondary rounded" style={{ backgroundColor: 'var(--bg-card)' }}>
                                            <Row className="align-items-end g-2">
                                                <Col md={3}>
                                                    <Form.Label>Date</Form.Label>
                                                    <Form.Control type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)}
                                                        style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-unique)', borderColor: 'var(--bs-border-color)' }} />
                                                </Col>
                                                <Col md={3}>
                                                    <Form.Label>Start</Form.Label>
                                                    <Form.Select value={blockStart} onChange={e => setBlockStart(e.target.value)}
                                                        style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}>
                                                        <option value="">HH:00</option>
                                                        {[...Array(24)].map((_, i) => (
                                                            <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>{i}:00</option>
                                                        ))}
                                                    </Form.Select>
                                                </Col>
                                                <Col md={3}>
                                                    <Form.Label>End</Form.Label>
                                                    <Form.Select value={blockEnd} onChange={e => setBlockEnd(e.target.value)}
                                                        style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--bs-border-color)' }}>
                                                        <option value="">HH:00</option>
                                                        {[...Array(24)].map((_, i) => (
                                                            <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>{i}:00</option>
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
