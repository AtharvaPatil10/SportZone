import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Badge, Nav, Alert, Carousel } from 'react-bootstrap';
import axios from 'axios';
import VenueInfo from '../components/VenueInfo';
import BookingForm from '../components/BookingForm';
const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking State
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [venueBookings, setVenueBookings] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await axios.get(`/api/venues/${id}`);
        setVenue(res.data);

        // Set default sport if courts exist
        if (res.data.courts && res.data.courts.length > 0) {
          const sports = [...new Set(res.data.courts.map(c => c.sportType))];
          setSelectedSport(sports[0]);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load venue details.');
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [id]);

  // Update booked slots when court or date changes
  useEffect(() => {
      // Don't run if no court is selected
      if (!selectedCourt) {
          setBookedSlots([]);
          return;
      }

      const fetchCourtBookings = async () => {
        try {
            console.log(`Fetching bookings for Court ID: ${selectedCourt.id}`);
            const res = await axios.get(`/api/bookings/court/${selectedCourt.id}`);
            const bookings = res.data;
            
            if (!selectedDate) return;

             // 3. String-based date comparison (Safest for ISO strings)
            const relevantBookings = bookings.filter(b => {
                if (b.status === 'CANCELLED') return false;
                const bookingDateStr = b.startTime.split('T')[0];
                return bookingDateStr === selectedDate;
            });

            console.log(`Debug: Court has ${bookings.length} total bookings. Found ${relevantBookings.length} matching date.`);
            
            const slots = [];
            relevantBookings.forEach(b => {
                const start = new Date(b.startTime).getHours();
                const end = new Date(b.endTime).getHours();
                for (let i = start; i < end; i++) {
                    slots.push(i);
                }
            });
            setBookedSlots(slots);

        } catch (err) {
            console.error("Failed to fetch court bookings:", err);
        }
      };

      fetchCourtBookings();

  }, [selectedCourt, selectedDate]);

  const handleBook = async () => {
    setBookingError('');
    if (!selectedCourt || !selectedDate || !startTime || !endTime) {
      setBookingError('Please select all booking details.');
      return;
    }

    // Validation: Check for overlaps with booked slots
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    for (let i = startHour; i < endHour; i++) {
        if (bookedSlots.includes(i)) {
            setBookingError('Selected time slot overlaps with an existing booking.');
            return;
        }
    }

    // Validation: Future Time
    const startDateTime = new Date(`${selectedDate}T${startTime}:00`);
    const now = new Date();
    if (startDateTime < now) {
      setBookingError('Booking start time must be in the future.');
      return;
    }

    // Validation: 1-hour blocks
    const startMinutes = parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[1]);
    if (startMinutes !== 0 || endMinutes !== 0) {
      setBookingError('Booking must start and end on the hour (e.g., 10:00, 11:00).');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Calculate duration for price (simplified)
      const duration = endHour - startHour;
      const amount = duration * selectedCourt.pricePerHour;

      // Format date and time to ISO LocalDateTime string (YYYY-MM-DDTHH:mm:ss)
      const formattedStartTime = `${selectedDate}T${startTime}:00`;
      const formattedEndTime = `${selectedDate}T${endTime}:00`;

      const bookingData = {
        userId: user.id,
        courtId: selectedCourt.id,
        venueId: venue.id,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        amount: amount,
        status: 'CONFIRMED'
      };

      await axios.post('/api/bookings', bookingData);
      alert('Booking Confirmed!');
      navigate('/my-bookings');
    } catch (err) {
      console.error("Booking Error:", err);
      const msg = err.response?.data?.message || err.response?.data || 'Booking failed. Please try again.';
      setBookingError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <Alert variant="danger" className="m-5">{error}</Alert>;
  if (!venue) return <Alert variant="warning" className="m-5">Venue not found.</Alert>;

  // Filter courts by sport
  const availableSports = [...new Set((venue.courts || []).map(c => c.sportType))];
  const filteredCourts = (venue.courts || []).filter(c => c.sportType === selectedSport);

  return (
    <Container className="py-5">
      <Row>
        {/* Left Side: Venue Info */}
        <VenueInfo venue={venue} />

        {/* Right Side: Booking Card */}
        <BookingForm 
            venue={venue}
            availableSports={availableSports}
            selectedSport={selectedSport}
            setSelectedSport={setSelectedSport}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            filteredCourts={filteredCourts}
            selectedCourt={selectedCourt}
            setSelectedCourt={setSelectedCourt}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            bookedSlots={bookedSlots}
            bookingError={bookingError}
            setBookingError={setBookingError}
            handleBook={handleBook}
        />
      </Row>
    </Container>
  );
};

export default VenueDetails;
