package com.parkingbuilding.support.controller;

import java.time.Instant;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.dto.response.VehicleEntryExitHistoryResponse;
import com.parkingbuilding.support.dto.response.VehicleHistoryPagedResponse;
import com.parkingbuilding.support.service.DriverVehicleHistoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/support/driver/vehicles/entry-exit-history")
public class DriverVehicleHistoryController {

    private final DriverVehicleHistoryService driverVehicleHistoryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DRIVER', 'STAFF', 'MANAGER', 'ADMIN')")
    public ApiResponse<VehicleHistoryPagedResponse> getHistory(
            Authentication authentication,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "fromDate", required = false) Instant fromDate,
            @RequestParam(name = "toDate", required = false) Instant toDate,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "pageSize", defaultValue = "20") int pageSize) {

        Jwt jwt = requireJwt(authentication);
        Long userId = parseUserId(jwt.getClaimAsString("user_id"));
        String role = getRole(authentication);

        VehicleHistoryPagedResponse data = driverVehicleHistoryService.searchHistory(
                keyword,
                status,
                fromDate,
                toDate,
                page,
                pageSize,
                userId,
                role
        );

        return ApiResponse.ok("Get vehicle entry exit history successfully", data);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DRIVER', 'STAFF', 'MANAGER', 'ADMIN')")
    public ApiResponse<VehicleEntryExitHistoryResponse> getHistoryDetail(
            Authentication authentication,
            @PathVariable("id") Long id) {

        Jwt jwt = requireJwt(authentication);
        Long userId = parseUserId(jwt.getClaimAsString("user_id"));
        String role = getRole(authentication);

        VehicleEntryExitHistoryResponse data = driverVehicleHistoryService.getDetail(id, userId, role);

        return ApiResponse.ok("Get vehicle entry exit history successfully", data);
    }

    private Jwt requireJwt(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt;
        }
        throw new IllegalStateException("Authenticated JWT principal is required.");
    }

    private Long parseUserId(String userIdClaim) {
        if (userIdClaim == null || userIdClaim.isBlank()) {
            return null;
        }
        return Long.parseLong(userIdClaim);
    }

    private String getRole(Authentication authentication) {
        if (authentication == null) {
            return "DRIVER";
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.replace("ROLE_", ""))
                .filter(r -> r.equalsIgnoreCase("DRIVER") || 
                             r.equalsIgnoreCase("STAFF") || 
                             r.equalsIgnoreCase("MANAGER") || 
                             r.equalsIgnoreCase("ADMIN"))
                .findFirst()
                .orElse("DRIVER");
    }
}
