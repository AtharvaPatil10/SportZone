package com.sportzone.venue.controller;

import com.sportzone.venue.entity.Venue;
import com.sportzone.venue.service.VenueService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    @Autowired
    private VenueService venueService;

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<Venue> createVenue(
            @RequestPart("venue") @Valid Venue venue,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        System.out.println("Received Create Venue Request");
        if(images != null) {
            System.out.println("Number of images: " + images.size());
        } else {
            System.out.println("No images received.");
        }
        Venue createdVenue = venueService.createVenue(venue);
        if (images != null && !images.isEmpty()) {
            for (MultipartFile file : images) {
                venueService.addVenueImage(createdVenue.getId(), file);
            }
        }
        return ResponseEntity.ok(venueService.getVenueById(createdVenue.getId()));
    }

    @PostMapping(value = "/{id}/images", consumes = { "multipart/form-data" })
    public ResponseEntity<com.sportzone.venue.entity.VenueImage> uploadImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile file) {
        return ResponseEntity.ok(venueService.addVenueImage(id, file));
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) {
        venueService.deleteVenueImage(imageId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<Venue>> getAllVenues() {
        return ResponseEntity.ok(venueService.getAllVenues());
    }

    @GetMapping("/admin/all")
    public ResponseEntity<Page<Venue>> getAllVenuesForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(venueService.getAllVenuesForAdmin(page, size, search));
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
