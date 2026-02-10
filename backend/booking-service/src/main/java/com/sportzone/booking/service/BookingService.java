package com.sportzone.booking.service;

import com.sportzone.booking.entity.Booking;
import com.sportzone.booking.entity.BookingStatus;
import com.sportzone.booking.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    private void validateBookingTiming(Booking booking) {
        LocalDateTime start = booking.getStartTime();
        LocalDateTime end = booking.getEndTime();
        LocalDateTime now = LocalDateTime.now();

        if (start.isBefore(now) && booking.getStatus() != BookingStatus.BLOCKED) {
            throw new RuntimeException("Booking start time must be in the future.");
        }

        if (end.isBefore(start)) {
            throw new RuntimeException("Booking end time must be after start time.");
        }

        if (start.getMinute() != 0 || end.getMinute() != 0) {
            throw new RuntimeException("Booking timings must be in 1-hour blocks (e.g., 10:00, 11:00).");
        }
    }

    public Booking createBooking(Booking booking) {
        validateBookingTiming(booking);

        List<Booking> overlaps = bookingRepository.findOverlappingBookings(
                booking.getCourtId(), booking.getStartTime(), booking.getEndTime(), BookingStatus.CANCELLED);

        if (!overlaps.isEmpty()) {
            throw new RuntimeException("This slot is already booked. Please choose another time.");
        }

        return bookingRepository.save(booking);
    }

    public Page<Booking> getBookingsByUserPaginated(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("startTime").descending());
        return bookingRepository.findByUserId(userId, pageable);
    }

    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public Page<Booking> getAllBookings(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("startTime").descending());
        return bookingRepository.findAll(pageable);
    }

    public Page<Booking> getUpcomingBookings(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("startTime").ascending());
        return bookingRepository.findByStartTimeAfter(LocalDateTime.now(), pageable);
    }

    public List<Booking> getBookingsByVenue(Long venueId) {
        return bookingRepository.findByVenueId(venueId);
    }

    public Page<Booking> getBookingsByVenuePaginated(Long venueId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("startTime").descending());
        return bookingRepository.findByVenueId(venueId, pageable);
    }

    public List<Booking> getBookingsByCourt(Long courtId) {
        return bookingRepository.findByCourtId(courtId);
    }

    public Booking confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.CONFIRMED);
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    public Booking updateBooking(Long bookingId, Booking bookingDetails) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Booking tempBooking = new Booking();
        tempBooking.setStartTime(bookingDetails.getStartTime());
        tempBooking.setEndTime(bookingDetails.getEndTime());
        validateBookingTiming(tempBooking);

        List<Booking> overlaps = bookingRepository.findOverlappingBookings(
                booking.getCourtId(), bookingDetails.getStartTime(), bookingDetails.getEndTime(),
                BookingStatus.CANCELLED);

        for (Booking existing : overlaps) {
            if (!existing.getId().equals(bookingId)) {
                throw new RuntimeException("This slot is already booked. Please choose another time.");
            }
        }

        booking.setStartTime(bookingDetails.getStartTime());
        booking.setEndTime(bookingDetails.getEndTime());
        booking.setStatus(bookingDetails.getStatus());
        booking.setAmount(bookingDetails.getAmount());

        return bookingRepository.save(booking);
    }

    public void cancelBookingsByVenue(Long venueId) {
        List<Booking> bookings = bookingRepository.findByVenueId(venueId);
        for (Booking b : bookings) {
            b.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(b);
        }
    }

    public void cancelBookingsByCourt(Long courtId) {
        List<Booking> bookings = bookingRepository.findByCourtId(courtId);
        for (Booking b : bookings) {
            b.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(b);
        }
    }

    public void deleteBooking(Long bookingId) {
        if (!bookingRepository.existsById(bookingId)) {
            throw new RuntimeException("Booking not found");
        }
        bookingRepository.deleteById(bookingId);
    }

    @Scheduled(fixedRate = 60000)
    public void updatePastBookings() {
        LocalDateTime now = LocalDateTime.now();

        List<Booking> expiredBookings = bookingRepository.findByStatusAndEndTimeBefore(
                BookingStatus.CONFIRMED, now);

        for (Booking booking : expiredBookings) {
            booking.setStatus(BookingStatus.COMPLETED);
            bookingRepository.save(booking);
        }

        LocalDateTime tenMinutesAgo = now.minusMinutes(10);
        List<Booking> staleBookings = bookingRepository.findByStatusAndCreatedAtBefore(
                BookingStatus.PENDING, tenMinutesAgo);

        for (Booking booking : staleBookings) {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
        }
    }
}
