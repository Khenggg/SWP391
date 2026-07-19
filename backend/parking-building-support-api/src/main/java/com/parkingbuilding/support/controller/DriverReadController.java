package com.parkingbuilding.support.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.dto.response.DriverProfileResponse;
import com.parkingbuilding.support.service.DriverReadService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping({ "/api/support/driver", "/api/core/driver" })
public class DriverReadController {

    private final DriverReadService driverReadService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('DRIVER')")
    public ApiResponse<DriverProfileResponse> getMyProfile(Authentication authentication) {
        Jwt jwt = requireJwt(authentication);
        Long userId = parseUserId(jwt.getClaimAsString("user_id"));
        String username = jwt.getClaimAsString("username");

        return ApiResponse.ok(
                "Get current driver profile successfully",
                driverReadService.getDriverProfile(userId, username));
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
