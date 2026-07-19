package com.parkingbuilding.support.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.dto.response.ActiveReservationResponse;
import com.parkingbuilding.support.dto.response.DriverReservationHistoryResponse;
import com.parkingbuilding.support.service.DriverReadService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping({ "/api/support/reservations", "/api/core/reservations" })
public class DriverReservationReadController {

    private final DriverReadService driverReadService;

    @GetMapping("/me/active")
    @PreAuthorize("hasRole('DRIVER')")
    public ApiResponse<ActiveReservationResponse> getMyActiveReservation(Authentication authentication) {
        Jwt jwt = requireJwt(authentication);
        Long userId = parseUserId(jwt.getClaimAsString("user_id"));
        String username = jwt.getClaimAsString("username");

        return ApiResponse.ok(
                "Get active reservation successfully",
                driverReadService.getActiveReservation(userId, username));
    }

    @GetMapping("/me/history")
    @PreAuthorize("hasRole('DRIVER')")
    public ApiResponse<DriverReservationHistoryResponse> getMyReservationHistory(
            Authentication authentication,
            @RequestParam(name = "limit", required = false) Integer limit) {
        Jwt jwt = requireJwt(authentication);
        Long userId = parseUserId(jwt.getClaimAsString("user_id"));
        String username = jwt.getClaimAsString("username");

        return ApiResponse.ok(
                "Get reservation history successfully",
                driverReadService.getReservationHistory(userId, username, limit));
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
}
