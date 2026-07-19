package com.parkingbuilding.support.dto.request;

import jakarta.validation.constraints.NotBlank;

public record MockBarrierRequest(
        @NotBlank String gateId,
        @NotBlank String command) {
}
