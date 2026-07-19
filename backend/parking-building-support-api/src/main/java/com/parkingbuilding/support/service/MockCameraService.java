package com.parkingbuilding.support.service;

import org.springframework.stereotype.Service;

import com.parkingbuilding.support.dto.request.CameraScanRequest;
import com.parkingbuilding.support.dto.response.CameraScanResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class MockCameraService {
    public CameraScanResponse scan(CameraScanRequest request) {

        log.info("========== MOCK CAMERA EVENT ==========");
        log.info("Plate Number : {}", request.getPlateNumber());
        log.info("Image URL    : {}", request.getImageUrl());

        return CameraScanResponse.builder()
                .plateNumber(request.getPlateNumber())
                .imageUrl(request.getImageUrl())
                .event("CAMERA_SCAN")
                .status("SUCCESS")
                .timestamp(System.currentTimeMillis())
                .build();
    }
}
