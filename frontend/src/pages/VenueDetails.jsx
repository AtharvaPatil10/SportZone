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

  const [selectedSport, setSelectedSport] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [venueBookings, setVenueBookings] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await axios.get(`/api/venues/${id}`);
        setVenue(res.data);
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

  useEffect(() => {
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

    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    for (let i = startHour; i < endHour; i++) {
      if (bookedSlots.includes(i)) {
        setBookingError('Selected time slot overlaps with an existing booking.');
        return;
      }
    }

    const startDateTime = new Date(`${selectedDate}T${startTime}:00`);
    const now = new Date();
    if (startDateTime < now) {
      setBookingError('Booking start time must be in the future.');
      return;
    }

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
      const duration = endHour - startHour;
      const amount = duration * selectedCourt.pricePerHour;

      const formatDateTime = (dateStr, timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        const date = new Date(dateStr);
        date.setHours(h, m, 0, 0);
        const d = new Date(dateStr);
        d.setHours(h);
        d.setMinutes(m);
        d.setSeconds(0);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hour = String(d.getHours()).padStart(2, '0');
        const minute = String(d.getMinutes()).padStart(2, '0');
        const second = String(d.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
      };

      const formattedStartTime = formatDateTime(selectedDate, startTime);
      const formattedEndTime = formatDateTime(selectedDate, endTime);

      const bookingData = {
        userId: user.id,
        courtId: selectedCourt.id,
        venueId: venue.id,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        amount: amount,
        status: 'PENDING'
      };

      const bookingRes = await axios.post('/api/bookings', bookingData);
      const bookingId = bookingRes.data.id;

      const orderRes = await axios.post(`/api/payments/create-order?bookingId=${bookingId}&amount=${amount}`);
      const { razorpayOrderId, amount: orderAmount } = orderRes.data;

      const options = {
        key: "rzp_test_S9bqIdw18b4II0",
        amount: orderAmount * 100,
        currency: "INR",
        name: "SportZone",
        description: "Venue Booking",
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            await axios.post('/api/payments/update-status', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              status: 'PAID'
            });

            await axios.put(`/api/bookings/${bookingId}/confirm`);

            alert('Payment Successful! Booking Confirmed.');
            navigate('/my-bookings');
          } catch (err) {
            console.error("Payment Confirmation Failed", err);
            alert('Payment success but server update failed. Please contact support.');
          }
        },
        prefill: {
          name: user.username,
          email: user.email,
          contact: "9999999999"
        },
        theme: {
          color: "#0d6efd"
        },
        modal: {
          ondismiss: async function () {
            if (confirm("Are you sure you want to cancel the payment? The slot will be released.")) {
              try {
                await axios.delete(`/api/bookings/${bookingId}`);
              } catch (err) {
                console.error("Deletion failed", err);
              }
            }
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', async function (response) {
        alert("Payment Failed: " + response.error.description);
        console.error(response.error);
        try {
          await axios.delete(`/api/bookings/${bookingId}`);
        } catch (err) {
          console.error("Deletion failed", err);
        }
      });
      rzp1.open();

    } catch (err) {
      console.error("Booking/Payment Error:", err);
      const msg = err.response?.data?.message || err.response?.data || 'Booking initiation failed. Please try again.';
      setBookingError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <Alert variant="danger" className="m-5">{error}</Alert>;
  if (!venue) return <Alert variant="warning" className="m-5">Venue not found.</Alert>;

  const availableSports = [...new Set((venue.courts || []).map(c => c.sportType))];
  const filteredCourts = (venue.courts || []).filter(c => c.sportType === selectedSport);

  return (
    <Container className="py-5">
      <Row>
        <VenueInfo venue={venue} />

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
