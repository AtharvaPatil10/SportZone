package com.sportzone.venue.service;

import com.sportzone.venue.entity.Court;
import com.sportzone.venue.entity.Venue;
import com.sportzone.venue.entity.VenueImage;
import com.sportzone.venue.repository.CourtRepository;
import com.sportzone.venue.repository.VenueImageRepository;
import com.sportzone.venue.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;

@Service
public class VenueService {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private CourtRepository courtRepository;

    @Autowired
    private VenueImageRepository venueImageRepository;

    @Autowired
    private FileStorageService fileStorageService;



    @Value("${app.booking.ip}")
    private String serverIp;

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

    public Page<Venue> getAllVenuesForAdmin(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size);
        if (search != null && !search.isEmpty()) {
            return venueRepository.findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(search, search,
                    pageable);
        }
        return venueRepository.findAll(pageable);
    }

    public Venue approveVenue(Long id) {
        Venue venue = getVenueById(id);
        venue.setStatus("APPROVED");
        return venueRepository.save(venue);
    }

    public void deleteVenue(Long id) {
        Venue venue = getVenueById(id);
        
        if (venue.getImages() != null) {
            for (VenueImage img : venue.getImages()) {
                try {
                    String fileName = img.getImageUrl().substring(img.getImageUrl().lastIndexOf("/") + 1);
                    fileStorageService.deleteFile(fileName);
                } catch (Exception e) {
                    System.err.println("Error deleting image file for venue " + id + ": " + e.getMessage());
                }
            }
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.put("http://" + serverIp + ":8083/api/bookings/venue/" + id + "/cancel", null);
        } catch (Exception e) {
            System.err.println("Failed to cancel bookings for venue " + id + ": " + e.getMessage());
        }
        venueRepository.delete(venue);
    }

    public void deleteCourt(Long courtId) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.put("http://" + serverIp + ":8083/api/bookings/court/" + courtId + "/cancel", null);
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

    public VenueImage addVenueImage(Long venueId, MultipartFile file) {
        Venue venue = getVenueById(venueId);

        int imageNo = (venue.getImages() != null ? venue.getImages().size() : 0) + 1;
        String extension = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            extension = original.substring(original.lastIndexOf("."));
        } else {
            extension = ".jpg";
        }

        String fileName = "Venue" + venueId + "." + imageNo + extension;
        fileStorageService.storeFile(file, fileName);

        String fileUrl = "/images/venue-images/" + fileName;

        VenueImage venueImage = new VenueImage();
        venueImage.setImageUrl(fileUrl);
        venueImage.setVenue(venue);

        if (venue.getImageUrl() == null || venue.getImageUrl().isEmpty()) {
            venue.setImageUrl(fileUrl);
            venueRepository.save(venue);
        }

        if (venue.getImages() == null)
            venue.setImages(new ArrayList<>());
        venue.getImages().add(venueImage);
        venueRepository.save(venue);

        List<VenueImage> images = venue.getImages();
        return images.get(images.size() - 1);
    }

    public void deleteVenueImage(Long imageId) {
        VenueImage img = venueImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        String fileName = img.getImageUrl().substring(img.getImageUrl().lastIndexOf("/") + 1);
        fileStorageService.deleteFile(fileName);

        venueImageRepository.delete(img);
    }
}
