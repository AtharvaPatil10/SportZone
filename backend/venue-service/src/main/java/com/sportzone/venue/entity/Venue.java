package com.sportzone.venue.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "venues")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "Venue name is required")
    private String name;

    @Column(nullable = false)
    @NotBlank(message = "Location is required")
    private String location;

    @Column(length = 1000)
    @Size(max = 1000, message = "Description too long")
    private String description;

    private String imageUrl;

    private String openTime;
    private String closeTime;

    private Long ownerId;

    @Column(nullable = false)
    private String status = "PENDING"; // APPROVED, PENDING, REJECTED

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<VenueImage> images;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL)
    private List<Court> courts;

}
