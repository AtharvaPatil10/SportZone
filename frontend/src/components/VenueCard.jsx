import React from 'react';
import { Card, Button, Badge, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const VenueCard = ({ venue }) => {
  const images = (venue.images && venue.images.length > 0)
    ? venue.images.map(img => img.imageUrl)
    : [venue.imageUrl || "https://via.placeholder.com/400x200?text=SportZone"];

  return (
    <Card className="h-100 overflow-hidden bg-dark border-secondary shadow-sm">
      <div className="position-relative">
        <Carousel interval={2000} indicators={false} nextLabel="" prevLabel="" controls={false} fade>
          {images.map((img, idx) => (
            <Carousel.Item key={idx}>
              <img
                className="d-block w-100"
                src={img}
                alt={`${venue.name} slide ${idx}`}
                style={{ height: '220px', objectFit: 'cover', filter: 'brightness(0.95)' }}
                onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x200?text=SportZone"; }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="fw-bold fs-4 mb-1" style={{ color: 'var(--accent-neon)' }}>{venue.name}</Card.Title>
        <Card.Text className="text-secondary mb-3 small"><i className="bi bi-geo-alt me-1"></i>{venue.location}</Card.Text>

        {/* Show available sports as badges */}
        <div className="mb-3">
          {venue.courts && [...new Set(venue.courts.map(c => c.sportType))].map(sport => (
            <Badge key={sport} bg="secondary" className="me-1">{sport}</Badge>
          ))}
        </div>

        <div className="mb-3 text-secondary small d-flex align-items-center">
          <i className="bi bi-clock me-2 text-warning"></i>
          <span>{venue.openTime || '06:00'} - {venue.closeTime || '23:00'}</span>
        </div>

        <Card.Text className="text-secondary mb-4 flex-grow-1" style={{ opacity: 0.9 }}>{venue.description}</Card.Text>
        <Button
          as={Link}
          to={`/venues/${venue.id}`}
          variant="outline-primary"
          className="w-100 mt-auto fw-bold"
          style={{ borderRadius: '5px', textTransform: 'uppercase' }}
        >
          View Details
        </Button>
      </Card.Body>
    </Card>
  );
};

export default VenueCard;
