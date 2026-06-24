package com.parkingbuilding.support.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AvailableSlotResponse {

    private Long id;
    private String slotCode;
    private Long areaId;
    private Long vehicleTypeId;
}