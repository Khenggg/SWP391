package com.parkingbuilding.support.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CameraScanRequest {
    @NotBlank(message = "Plate number is required")
    private String plateNumber;

    private String imageUrl;
}
