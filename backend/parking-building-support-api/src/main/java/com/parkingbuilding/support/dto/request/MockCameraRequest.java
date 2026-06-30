package com.parkingbuilding.support.dto.request;

import jakarta.validation.constraints.NotBlank;

public record MockCameraRequest(
        @NotBlank String licensePlate,
        @NotBlank String gateId,
        String imagePath) {
}
