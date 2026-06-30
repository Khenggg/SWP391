package com.parkingbuilding.support.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.dto.request.MockBarrierRequest;
import com.parkingbuilding.support.service.MockDeviceService;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/mock/barrier")
@RequiredArgsConstructor
@Tag(name = "Mock Barrier", description = "Giả lập mở/đóng barrier")
public class MockBarrierController {

    private final MockDeviceService mockDeviceService;

    @PostMapping("/control")
    @Operation(summary = "Giả lập lệnh điều khiển barrier")
    public ResponseEntity<ApiResponse<Void>> mockBarrierControl(@RequestBody @jakarta.validation.Valid MockBarrierRequest request) {
        mockDeviceService.mockBarrierControl(request);
        return ResponseEntity.ok(ApiResponse.ok("Barrier control command received successfully"));
    }
}
