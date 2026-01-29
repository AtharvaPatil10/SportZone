package com.sportzone.venue.service;

import com.sportzone.venue.entity.Court;
import com.sportzone.venue.entity.Venue;
import com.sportzone.venue.repository.CourtRepository;
import com.sportzone.venue.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class VenueService {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private CourtRepository courtRepository;

    public Venue createVenue(Venue venue) {
        venue.setStatus("PENDING");
        if (venue.getCourts() != null) {
            for (Court court : venue.getCourts()) {
                court.setVenue(venue);
            }
        }
        return venueRepository.save(venue);
    }

    public List<Venue> getAllVenues() {
        return venueRepository.findByStatus("APPROVED");
    }

    public List<Venue> getAllVenuesForAdmin() {
        return venueRepository.findAll();
    }

    public Venue approveVenue(Long id) {
        Venue venue = getVenueById(id);
        venue.setStatus("APPROVED");
        return venueRepository.save(venue);
    }

    public void deleteVenue(Long id) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.put("http://localhost:8083/api/bookings/venue/" + id + "/cancel", null);
        } catch (Exception e) {
            System.err.println("Failed to cancel bookings for venue " + id + ": " + e.getMessage());
        }
        venueRepository.deleteById(id);
    }

    public void deleteCourt(Long courtId) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.put("http://localhost:8083/api/bookings/court/" + courtId + "/cancel", null);
        } catch (Exception e) {
            System.err.println("Failed to cancel bookings for court " + courtId + ": " + e.getMessage());
        }
        courtRepository.deleteById(courtId);
    }

    public Venue getVenueById(Long id) {
        return venueRepository.findById(id).orElseThrow(() -> new RuntimeException("Venue not found"));
    }

    public List<Venue> searchVenues(String location) {
        return venueRepository.findByLocationContainingIgnoreCase(location);
    }

    public List<Venue> getVenuesByOwner(Long ownerId) {
        return venueRepository.findByOwnerId(ownerId);
    }

    public Venue updateVenue(Long id, Venue venueDetails) {
        Venue venue = getVenueById(id);

        if (venueDetails.getName() != null)
            venue.setName(venueDetails.getName());

        if (venueDetails.getLocation() != null)
            venue.setLocation(venueDetails.getLocation());

        if (venueDetails.getDescription() != null)
            venue.setDescription(venueDetails.getDescription());

        if (venueDetails.getImageUrl() != null)
            venue.setImageUrl(venueDetails.getImageUrl());

        if (venueDetails.getOwnerId() != null)
            venue.setOwnerId(venueDetails.getOwnerId());

        if (venueDetails.getOpenTime() != null)
            venue.setOpenTime(venueDetails.getOpenTime());

        if (venueDetails.getCloseTime() != null)
            venue.setCloseTime(venueDetails.getCloseTime());

        if (venueDetails.getCourts() != null && !venueDetails.getCourts().isEmpty()) {
            List<Court> newCourts = venueDetails.getCourts();
            for (Court court : newCourts) {
                court.setVenue(venue);
            }
            if (venue.getCourts() == null) {
                venue.setCourts(newCourts);
            } else {
                venue.getCourts().addAll(newCourts);
            }
        }

        return venueRepository.save(venue);
    }
}
