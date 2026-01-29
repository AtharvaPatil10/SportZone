import React, { useState, useEffect } from 'react';
import { Col, Card, Alert, Nav, Form, Row, Badge, Button } from 'react-bootstrap';

const BookingForm = ({ 
    venue, 
    availableSports, 
    selectedSport, 
    setSelectedSport,
    selectedDate, 
    setSelectedDate,
    filteredCourts, 
    selectedCourt, 
    setSelectedCourt,
    startTime, 
    setStartTime,
    endTime, 
    setEndTime,
    bookedSlots,
    bookingError,
    setBookingError,
    handleBook 
}) => {

    const handleTimeSlotClick = (hour) => {
        const isBooked = bookedSlots.includes(hour);
        if (isBooked) return;

        const currentStart = startTime ? parseInt(startTime.split(':')[0]) : null;
        
        // Deselect if clicking the only selected hour
        if (currentStart === hour && parseInt(endTime.split(':')[0]) === hour + 1) {
            setStartTime('');
            setEndTime('');
            return;
        }

        if (currentStart === null) {
            // Start new selection
            setStartTime(`${hour.toString().padStart(2, '0')}:00`);
            setEndTime(`${(hour + 1).toString().padStart(2, '0')}:00`);
            return;
        }

        if (hour > currentStart) {
            // Check for blocks in between
            let blocked = false;
            for (let h = currentStart; h < hour; h++) {
                if (bookedSlots.includes(h)) blocked = true;
            }
            
            if (!blocked) {
                // Extend
                setEndTime(`${(hour + 1).toString().padStart(2, '0')}:00`);
            } else {
                // Reset
                setStartTime(`${hour.toString().padStart(2, '0')}:00`);
                setEndTime(`${(hour + 1).toString().padStart(2, '0')}:00`);
            }
        } else {
            // Reset (clicking before)
            setStartTime(`${hour.toString().padStart(2, '0')}:00`);
            setEndTime(`${(hour + 1).toString().padStart(2, '0')}:00`);
        }
    };

    return (
        <Col lg={5}>
          <Card className="border-0 shadow-lg sticky-top bg-dark card-body-theme" style={{ top: '100px', borderRadius: '15px', zIndex: 1, backgroundColor: 'var(--bg-card)' }}>
            <Card.Body className="p-4">
              <h3 className="fw-bold mb-4">Book a Slot</h3>

              {bookingError && <Alert variant="danger">{bookingError}</Alert>}

              {/* Sport Selection Tabs */}
              <Nav variant="pills" className="mb-4 justify-content-center p-1" style={{ background: 'transparent' }}>
                {availableSports.map(sport => (
                  <Nav.Item key={sport}>
                    <Nav.Link
                      active={selectedSport === sport}
                      onClick={() => { setSelectedSport(sport); setSelectedCourt(null); }}
                      className={selectedSport === sport ? '' : 'text-secondary'}
                      style={{ 
                          color: selectedSport === sport ? 'var(--text-primary)' : '', 
                          borderRadius: '10px', 
                          minWidth: '100px', 
                          textAlign: 'center',
                          backgroundColor: 'transparent',
                          border: selectedSport === sport ? '1px solid #0dcaf0' : '1px solid transparent',
                          boxShadow: selectedSport === sport ? '0 0 15px rgba(13, 202, 240, 0.5)' : 'none',
                          transition: 'all 0.3s ease',
                          fontWeight: selectedSport === sport ? 'bold' : 'normal'
                      }}
                    >
                      {sport}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>

              <Form>
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label className="fw-bold small text-secondary">DATE</Form.Label>
                      <Form.Control
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small text-secondary">SELECT COURT</Form.Label>
                  <div className="d-flex flex-column gap-2">
                    {filteredCourts.map(court => (
                      <div
                        key={court.id}
                        className={`p-3 border rounded d-flex justify-content-between align-items-center cursor-pointer ${selectedCourt?.id === court.id ? 'border-primary' : ''}`}
                        onClick={() => setSelectedCourt(court)}
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          backgroundColor: selectedCourt?.id === court.id ? 'rgba(13, 110, 253, 0.2)' : 'var(--input-bg)',
                          borderColor: selectedCourt?.id === court.id ? 'var(--accent-neon)' : 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <div>
                          <div className="fw-bold">{court.name}</div>
                          <small className="text-secondary">{court.sportType}</small>
                        </div>
                        <div className="text-primary fw-bold">₹{court.pricePerHour}/hr</div>
                      </div>
                    ))}
                  </div>
                </Form.Group>

                <Row className="mb-4">
                  <Col>
                    <Form.Group>
                      <Form.Label className="fw-bold small text-secondary text-uppercase mb-3">Select Time Slot</Form.Label>
                      
                      {!selectedDate || !selectedCourt ? (
                        <Alert variant="secondary" className="text-center small py-3 opacity-75">
                           Please select a Date and Court to view availability.
                        </Alert>
                      ) : (
                        <>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="fw-bold fs-5" style={{ color: 'var(--text-primary)' }}>
                                {startTime && endTime ? `${startTime} - ${endTime}` : 'Select a Slot'}
                            </span>
                            {startTime && endTime && (
                                <Badge bg="info" className="text-dark">
                                    {(parseInt(endTime.split(':')[0]) - parseInt(startTime.split(':')[0]))} Hour Session
                                </Badge>
                            )}
                          </div>

                          <div className="mb-4">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                {(() => {
                                    // Default to 24 hours (00:00 - 24:00) if not set
                                    const open = venue.openTime ? parseInt(venue.openTime.split(':')[0]) : 0;
                                    const close = venue.closeTime ? parseInt(venue.closeTime.split(':')[0]) : 24;
                                    const totalHours = close - open;

                                    return [...Array(totalHours)].map((_, idx) => {
                                    const hour = idx + open; 
                                    const isBooked = bookedSlots.includes(hour);
                                    
                                    const startH = startTime ? parseInt(startTime.split(':')[0]) : null;
                                    const endH = endTime ? parseInt(endTime.split(':')[0]) : null;
                                    const isSelected = startH !== null && endH !== null && hour >= startH && hour < endH;

                                    return (
                                        <div 
                                            key={hour}
                                            onClick={() => handleTimeSlotClick(hour)}
                                            className={`d-flex flex-column align-items-center justify-content-center position-relative time-slot ${isSelected ? 'selected' : ''}`}
                                            style={{ 
                                                width: '100%', 
                                                height: '45px', 
                                                cursor: isBooked ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                borderRadius: '8px',
                                                background: isBooked 
                                                    ? 'rgba(255, 0, 0, 0.1)' 
                                                    : isSelected 
                                                        ? 'linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)' 
                                                        : 'var(--input-bg)',
                                                border: isBooked 
                                                    ? '1px solid rgba(255, 77, 77, 0.3)' 
                                                    : isSelected 
                                                        ? 'none' 
                                                        : '1px solid var(--border-color)',
                                                boxShadow: isSelected 
                                                    ? '0 4px 15px rgba(13, 202, 240, 0.4)' 
                                                    : 'none',
                                                transform: isSelected ? 'translateY(-2px)' : 'none',
                                                opacity: isBooked ? 0.6 : 1
                                            }}
                                            title={isBooked ? 'Booked' : `${hour}:00 - ${hour+1}:00`}
                                        >
                                            <span style={{ 
                                                fontSize: '0.75rem', 
                                                fontWeight: isSelected ? '800' : '600',
                                                color: isBooked ? '#ff6b6b' : isSelected ? '#fff' : 'var(--text-primary)'
                                            }}>
                                                {hour}:00 - {hour+1}:00
                                            </span>
                                            {isBooked && <i className="bi bi-x-circle-fill text-danger position-absolute" style={{fontSize: '0.7rem', bottom: '5px', opacity: 0.8}}></i>}
                                            {isSelected && <i className="bi bi-check-circle-fill text-white position-absolute" style={{fontSize: '0.7rem', bottom: '5px', opacity: 0.8}}></i>}
                                        </div>
                                    );
                                    });
                                })()}
                            </div>
                            <div className="d-flex justify-content-center gap-4 mt-4 small text-secondary">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="rounded-circle" style={{width:12, height:12, background:'var(--input-bg)', border:'1px solid var(--border-color)'}}></div>
                                    Available
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="rounded-circle" style={{width:12, height:12, background:'linear-gradient(135deg, #0d6efd, #0dcaf0)'}}></div>
                                    Selected
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="rounded-circle" style={{width:12, height:12, background:'rgba(255,0,0,0.2)', border:'1px solid rgba(255,0,0,0.3)'}}></div>
                                    Booked
                                </div>
                            </div>
                          </div>
                      </>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                {selectedCourt && startTime && endTime && (
                  <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{ background: 'var(--input-bg)', border: '1px solid var(--accent-neon)' }}>
                    <span className="text-secondary">Total Amount</span>
                    <span className="h4 mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
                      ₹{(parseInt(endTime.split(':')[0]) - parseInt(startTime.split(':')[0])) * selectedCourt.pricePerHour}
                    </span>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  className="w-100 fw-bold py-3"
                  onClick={handleBook}
                  style={{ borderRadius: '10px' }}
                  disabled={!startTime || !endTime}
                >
                  Confirm Booking
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
    );
};

export default BookingForm;
