package com.sportzone.booking.controller;

import com.sportzone.booking.entity.Booking;
import com.sportzone.booking.service.BookingService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody Booking booking) {
        return ResponseEntity.ok(bookingService.createBooking(booking));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<Booking>> getUserBookings(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(bookingService.getBookingsByUserPaginated(userId, page, size));
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<Booking>> getBookingsByVenue(@PathVariable Long venueId) {
        return ResponseEntity.ok(bookingService.getBookingsByVenue(venueId));
    }

    @GetMapping("/court/{courtId}")
    public ResponseEntity<List<Booking>> getBookingsByCourt(@PathVariable Long courtId) {
        return ResponseEntity.ok(bookingService.getBookingsByCourt(courtId));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id,
            @Valid @RequestBody Booking booking) {
        return ResponseEntity.ok(bookingService.updateBooking(id, booking));
    }

    @PutMapping("/venue/{venueId}/cancel")
    public ResponseEntity<Void> cancelBookingsByVenue(@PathVariable Long venueId) {
        bookingService.cancelBookingsByVenue(venueId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/court/{courtId}/cancel")
    public ResponseEntity<Void> cancelBookingsByCourt(@PathVariable Long courtId) {
        bookingService.cancelBookingsByCourt(courtId);
        return ResponseEntity.ok().build();
    }
}
