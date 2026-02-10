import { useState, useEffect } from 'react';
import { Container, Table, Alert, Badge, Tabs, Tab, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const user = JSON.parse(localStorage.getItem('user'));
  const { theme } = useTheme();

  const fetchBookings = async (page = 0) => {
    if (!user) return;
    try {
      const response = await axios.get(`/api/bookings/user/${user.id}?page=${page}&size=10`);

      const content = response.data.content || [];
      setTotalPages(response.data.totalPages);

      const sortedBookings = content.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      setBookings(sortedBookings);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your bookings');
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchBookings(currentPage);
    }
  }, [user?.id, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const initiateCancel = (e, bookingId) => {
    e.stopPropagation();
    console.log("Initiating cancel for:", bookingId);
    setSelectedBookingId(bookingId);
    setShowModal(true);
  };

  const confirmCancel = async () => {
    if (!selectedBookingId) return;

    try {
      await axios.put(`/api/bookings/${selectedBookingId}/cancel`);
      setShowModal(false);
      setSelectedBookingId(null);
      alert('Booking Cancelled Successfully!');
      fetchBookings(currentPage);
    } catch (err) {
      console.error("Cancellation failed:", err);
      alert('Failed to cancel booking. Please try again.');
      setShowModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBookingId(null);
  };

  if (!user) return <Alert variant="warning">Please login to view bookings.</Alert>;

  const now = new Date();
  const upcomingBookings = bookings.filter(b => new Date(b.startTime) > now && b.status !== 'CANCELLED' && b.status !== 'COMPLETED');
  const pastBookings = bookings.filter(b => (new Date(b.startTime) <= now && b.status !== 'CANCELLED') || b.status === 'COMPLETED');
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');

  const BookingTable = ({ data, showCancel }) => (
    <Table striped bordered hover responsive variant={theme === 'dark' ? 'dark' : 'light'} className="shadow-sm">
      <thead className={theme === 'dark' ? "text-white" : "bg-light text-dark"} style={{ backgroundColor: theme === 'dark' ? 'var(--bg-dark-highlight, #2c3034)' : '' }}>
        <tr>
          <th>Booking ID</th>
          <th>Court ID</th>
          <th>Date</th>
          <th>Time</th>
          <th>Amount</th>
          <th>Status</th>
          {showCancel && <th>Action</th>}
        </tr>
      </thead>
      <tbody>
        {data.map(booking => (
          <tr key={booking.id}>
            <td>{booking.id}</td>
            <td>{booking.courtId}</td>
            <td>{booking.startTime.split('T')[0]}</td>
            <td>
              {booking.startTime.split('T')[1].substring(0, 5)} - {booking.endTime.split('T')[1].substring(0, 5)}
            </td>
            <td>₹{booking.amount}</td>
            <td>
              <Badge bg={
                booking.status === 'CONFIRMED' ? 'success' :
                  booking.status === 'CANCELLED' ? 'danger' :
                    booking.status === 'COMPLETED' ? 'secondary' : 'warning'
              }>
                {booking.status}
              </Badge>
            </td>
            {showCancel && (
              <td>
                <Button variant="danger" size="sm" onClick={(e) => initiateCancel(e, booking.id)}>Cancel Booking</Button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <Container className="mt-5">
      <h2 className="mb-4">My Bookings</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Tabs defaultActiveKey="upcoming" id="booking-tabs" className="mb-3">
        <Tab eventKey="upcoming" title={`Upcoming (${upcomingBookings.length})`}>
          {upcomingBookings.length === 0 ? (
            <Alert variant="info">No upcoming bookings on this page.</Alert>
          ) : (
            <BookingTable data={upcomingBookings} showCancel={true} />
          )}
        </Tab>
        <Tab eventKey="past" title="Past Bookings">
          {pastBookings.length === 0 ? (
            <Alert variant="light">No past bookings on this page.</Alert>
          ) : (
            <BookingTable data={pastBookings} />
          )}
        </Tab>
        <Tab eventKey="cancelled" title={`Cancelled (${cancelledBookings.length})`}>
          {cancelledBookings.length === 0 ? (
            <Alert variant="light">No cancelled bookings on this page.</Alert>
          ) : (
            <BookingTable data={cancelledBookings} />
          )}
        </Tab>
      </Tabs>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-4 mb-5 gap-3">
          <Button
            variant="outline-primary"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            &laquo; Previous
          </Button>
          <span className="text-muted fw-bold">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline-primary"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
          >
            Next &raquo;
          </Button>
        </div>
      )}

      <Modal show={showModal} onHide={handleCloseModal} centered style={{ zIndex: 1055 }}>
        <Modal.Header closeButton className="bg-dark text-white" style={{ borderBottom: '1px solid #333' }}>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <p>Are you sure you want to cancel this booking?</p>
          <p className="text-danger small mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="bg-dark" style={{ borderTop: '1px solid #333' }}>
          <Button variant="secondary" onClick={handleCloseModal}>
            No, Keep it
          </Button>
          <Button variant="danger" onClick={confirmCancel}>
            Yes, Cancel Booking
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserBookings;
