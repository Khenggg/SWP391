package com.parkingbuilding.support.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.dto.request.MockRfidRequest;
import com.parkingbuilding.support.service.MockDeviceService;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/mock/rfid")
@RequiredArgsConstructor
@Tag(name = "Mock RFID")
public class MockRfidController {

    private final MockDeviceService mockDeviceService;

    @PostMapping("/scan")
    @Operation(summary = "Giả lập sự kiện RFID scan")
    public ResponseEntity<ApiResponse<Void>> mockRfidScan(@RequestBody @jakarta.validation.Valid MockRfidRequest request) {
        mockDeviceService.mockRfidScan(request);
        return ResponseEntity.ok(ApiResponse.ok("RFID scan event received successfully"));
    }
}
