package com.parkingbuilding.support.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.dto.request.MockCameraRequest;
import com.parkingbuilding.support.service.MockDeviceService;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/mock/camera")
@RequiredArgsConstructor
@Tag(name = "Mock Camera" )
public class MockCameraController {

    private final MockDeviceService mockDeviceService;

    @PostMapping("/scan")
    @Operation(summary = "Giả lập sự kiện camera scan biển số")
    public ResponseEntity<ApiResponse<Void>> mockCameraScan(@RequestBody @jakarta.validation.Valid MockCameraRequest request) {
        mockDeviceService.mockCameraScan(request);
        return ResponseEntity.ok(ApiResponse.ok("Camera scan event received successfully"));
    }
}
