package com.sportzone.booking.repository;

import com.sportzone.booking.entity.Booking;
import com.sportzone.booking.entity.BookingStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);

    Page<Booking> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.courtId = :courtId " +
            "AND b.status <> :status " +
            "AND ((b.startTime < :endTime) AND (b.endTime > :startTime))")
    List<Booking> findOverlappingBookings(@Param("courtId") Long courtId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("status") BookingStatus status);

    List<Booking> findByStatusAndEndTimeBefore(BookingStatus status, LocalDateTime now);

    List<Booking> findByVenueId(Long venueId);

    List<Booking> findByCourtId(Long courtId);
}
