package com.sportzone.venue.repository;

import com.sportzone.venue.entity.Venue;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {

    List<Venue> findByLocationContainingIgnoreCase(String location);

    List<Venue> findByOwnerId(Long ownerId);

    List<Venue> findByStatus(String status);

    Page<Venue> findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(String name, String location,
            Pageable pageable);
}
