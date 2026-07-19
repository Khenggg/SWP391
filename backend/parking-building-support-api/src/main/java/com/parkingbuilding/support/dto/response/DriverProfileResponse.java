package com.parkingbuilding.support.dto.response;

import java.time.OffsetDateTime;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DriverProfileResponse {
    Long driverId;
    Long userId;
    String username;
    String fullName;
    String phone;
    String email;
    String status;
    String driverType;
    String apartmentNumber;
    Boolean residentVerified;
    OffsetDateTime residentVerifiedAt;
    OffsetDateTime createdAt;
    OffsetDateTime updatedAt;
}
