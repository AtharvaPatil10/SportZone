import React from 'react';
import { Col, Carousel, Badge } from 'react-bootstrap';

const VenueInfo = ({ venue }) => {
  if (!venue) return null;

  return (
    <Col lg={7} className="mb-4">
      <div className="position-relative mb-4">
        <Carousel interval={2000} indicators={true} className="rounded shadow-sm overflow-hidden" fade>
          {((venue.images && venue.images.length > 0)
            ? venue.images.map(img => img.imageUrl)
            : [venue.imageUrl || "https://via.placeholder.com/800x400?text=SportZone"]
          ).map((img, idx) => (
            <Carousel.Item key={idx}>
              <img
                src={img}
                alt={`${venue.name} slide ${idx}`}
                className="d-block w-100"
                style={{ height: '400px', objectFit: 'cover' }}
                onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/800x400?text=SportZone"; }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      <h1 className="fw-bold" style={{ color: 'var(--text-primary)' }}>{venue.name}</h1>
      <p className="text-secondary fs-5"><i className="bi bi-geo-alt-fill me-2"></i>{venue.location}</p>
      <p className="fs-6" style={{ color: 'var(--text-primary)' }}>
        <i className="bi bi-clock-history me-2 text-warning"></i>
        <span className="fw-bold">Open Today:</span> {venue.openTime || '06:00'} - {venue.closeTime || '23:00'}
      </p>

      <div className="mt-4">
        <h4 className="fw-bold mb-3">About this Venue</h4>
        <p className="text-secondary" style={{ lineHeight: '1.8' }}>
          {venue.description}
        </p>
      </div>

      <div className="mt-4">
        <h4 className="fw-bold mb-3">Amenities</h4>
        <div className="d-flex flex-wrap gap-2">
          {['Parking', 'Changing Room', 'Drinking Water', 'Floodlights', 'Equipment Rental'].map((item, idx) => (
            <Badge key={idx} bg="secondary" className="border p-2 fw-normal">
              {item}
            </Badge>
          ))}
        </div>
      </div>
    </Col>
  );
};

export default VenueInfo;
