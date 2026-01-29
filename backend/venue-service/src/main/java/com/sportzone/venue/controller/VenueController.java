package com.sportzone.venue.controller;

import com.sportzone.venue.entity.Venue;
import com.sportzone.venue.service.VenueService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    @Autowired
    private VenueService venueService;

    @PostMapping
    public ResponseEntity<Venue> createVenue(@Valid @RequestBody Venue venue) {
        return ResponseEntity.ok(venueService.createVenue(venue));
    }

    @GetMapping
    public ResponseEntity<List<Venue>> getAllVenues() {
        return ResponseEntity.ok(venueService.getAllVenues());
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<Venue>> getAllVenuesForAdmin() {
        return ResponseEntity.ok(venueService.getAllVenuesForAdmin());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Venue> approveVenue(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.approveVenue(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long id) {
        venueService.deleteVenue(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/courts/{courtId}")
    public ResponseEntity<Void> deleteCourt(@PathVariable Long courtId) {
        venueService.deleteCourt(courtId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venue> getVenue(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.getVenueById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Venue>> searchVenues(@RequestParam String location) {
        return ResponseEntity.ok(venueService.searchVenues(location));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<Venue>> getVenuesByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(venueService.getVenuesByOwner(ownerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Venue> updateVenue(@PathVariable Long id, @Valid @RequestBody Venue venue) {
        return ResponseEntity.ok(venueService.updateVenue(id, venue));
    }
}
