import React from 'react';
import { Card, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const FeaturedSportCard = ({ name, img }) => {
  return (
    <Col md={3} className="mb-4">
      <Link to={`/venues?sport=${name}`} style={{ textDecoration: 'none' }}>
        <Card
          className="h-100 text-center py-5 border-0 sport-card position-relative overflow-hidden"
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '200px'
          }}
        >
          {/* Dark Overlay for readability */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              transition: 'background-color 0.3s ease'
            }}
            className="card-overlay"
          ></div>

          <Card.Body className="position-relative d-flex align-items-center justify-content-center">
            <h3 className="fw-bold mb-0 text-white text-uppercase" style={{ letterSpacing: '2px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {name}
            </h3>
          </Card.Body>
        </Card>
      </Link>
    </Col>
  );
};

export default FeaturedSportCard;
