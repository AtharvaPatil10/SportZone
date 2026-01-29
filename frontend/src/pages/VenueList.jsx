import { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import VenueCard from '../components/VenueCard';

const VenueList = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedSport = searchParams.get('sport');

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get('/api/venues');
        setVenues(response.data);
      } catch (err) {
        console.error(err);
        // Mock fallback deleted for brevity/cleanliness
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  // Filter venues based on selected sport
  const filteredVenues = selectedSport
    ? venues.filter(venue =>
      venue.courts && venue.courts.some(court =>
        court.sportType && court.sportType.toLowerCase() === selectedSport.toLowerCase()
      )
    )
    : venues;

  if (loading) return <div className="text-center mt-5 text-secondary">Loading Venues...</div>;

  return (
    <Container className="py-5">
      <h2 className="mb-4 fw-bold text-center" style={{ letterSpacing: '1px' }}>
        {selectedSport ? (
          <span>VENUES FOR <span style={{ color: 'var(--accent-neon)' }}>{selectedSport.toUpperCase()}</span></span>
        ) : (
          <span>EXPLORE <span style={{ color: 'var(--accent-neon)' }}>VENUES</span></span>
        )}
      </h2>

      {selectedSport && (
        <div className="text-center mb-5">
          <Button as={Link} to="/venues" variant="outline-light" size="sm">Show All Venues</Button>
        </div>
      )}

      {filteredVenues.length === 0 && (
        <div className="text-center text-secondary py-5">
          <h4>No venues found for {selectedSport}</h4>
          <Button as={Link} to="/venues" variant="primary" className="mt-3">View All Venues</Button>
        </div>
      )}

      <Row>
        {filteredVenues.map(venue => (
          <Col md={4} key={venue.id} className="mb-4">
            <VenueCard venue={venue} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default VenueList;
