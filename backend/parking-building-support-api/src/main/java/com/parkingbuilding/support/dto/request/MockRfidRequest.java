package com.parkingbuilding.support.dto.request;

import jakarta.validation.constraints.NotBlank;

public record MockRfidRequest(
        @NotBlank String cardCode,
        @NotBlank String gateId) {
}
