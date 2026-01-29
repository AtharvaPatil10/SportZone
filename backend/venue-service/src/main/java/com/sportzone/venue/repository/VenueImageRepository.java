package com.sportzone.venue.repository;

import com.sportzone.venue.entity.VenueImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueImageRepository extends JpaRepository<VenueImage, Long> {
    List<VenueImage> findByVenueId(Long venueId);
}
