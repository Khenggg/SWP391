package com.parkingbuilding.support.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CameraScanResponse {
    private String plateNumber;

    private String imageUrl;

    private String event;

    private String status;

    private Long timestamp;
}
