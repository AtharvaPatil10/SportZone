import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import FeaturedSportCard from '../components/FeaturedSportCard';

const Home = () => {
  return (
    <div className="home-background">
      <Container className="py-5">
        <Row className="align-items-center mb-5">
          <Col md={6}>
            <h1 className="display-3 fw-bold mb-3" style={{ textShadow: '0 0 10px rgba(0, 255, 136, 0.3)' }}>
              <span style={{ color: 'var(--accent-neon)' }}>PLAY</span> LIKE A PRO.<br />
              BOOK IN <span style={{ color: 'var(--accent-secondary)' }}>SECONDS</span>.
            </h1>
            <p className="lead text-secondary mb-4">
              Discover and book the best sports facilities near you. From badminton courts to football turfs, we have it all.
            </p>
            <Button as={Link} to="/venues" variant="primary" size="lg" className="px-5 py-3 rounded-pill shadow-lg">
              Find a Venue <i className="bi bi-arrow-right ms-2"></i>
            </Button>
          </Col>
          <Col md={6}>
            <div className="position-relative">
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100%', height: '100%', border: '2px solid var(--accent-neon)', borderRadius: '15px', zIndex: 0 }}></div>
              <img
                src="/images/home_main.jpg"
                alt="Sports"
                className="img-fluid rounded-3 shadow-lg position-relative"
                style={{ zIndex: 1, filter: 'brightness(0.9) contrast(1.1)' }}
              />
            </div>
          </Col>
        </Row>

        <h2 className="mb-4 fw-bold text-center" style={{ letterSpacing: '2px' }}>FEATURED <span style={{ color: 'var(--accent-neon)' }}>SPORTS</span></h2>
        <Row>
          {[
            { name: 'Badminton', img: '/images/badminton.jpg' },
            { name: 'Football', img: '/images/football.jpg' },
            { name: 'Tennis', img: '/images/tennis.jpg' },
            { name: 'Cricket', img: '/images/cricket.jpg' }
          ].map((sport, idx) => (
            <FeaturedSportCard key={idx} name={sport.name} img={sport.img} />
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Home;
