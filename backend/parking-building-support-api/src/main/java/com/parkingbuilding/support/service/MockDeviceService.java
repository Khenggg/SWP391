package com.parkingbuilding.support.service;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import com.parkingbuilding.support.dto.request.MockCameraRequest;
import com.parkingbuilding.support.dto.request.MockRfidRequest;
import com.parkingbuilding.support.dto.request.MockBarrierRequest;

@Service
@Slf4j
public class MockDeviceService {
    
    public void mockCameraScan(MockCameraRequest request) {
        log.info("MOCK EVENT - Camera scanned license plate: {} at gate: {} with image: {}", 
                request.licensePlate(), request.gateId(), request.imagePath());
    }
    
    public void mockRfidScan(MockRfidRequest request) {
        log.info("MOCK EVENT - RFID scanned card code: {} at gate: {}", request.cardCode(), request.gateId());
    }
    
    public void mockBarrierControl(MockBarrierRequest request) {
        log.info("MOCK EVENT - Barrier at gate: {} received command: {}", request.gateId(), request.command());
    }
}
