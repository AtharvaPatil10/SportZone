package com.sportzone.booking.client;

import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "venue-service")
public interface VenueClient {
}
