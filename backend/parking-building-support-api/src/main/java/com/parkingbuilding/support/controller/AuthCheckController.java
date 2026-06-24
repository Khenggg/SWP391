package com.parkingbuilding.support.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.common.ApiResponse;

@RestController
@RequestMapping("/api/support")
public class AuthCheckController {

    @GetMapping("/auth-check")
    public ApiResponse<?> authCheck(Authentication authentication) {
        Map<String, Object> data = new HashMap<>();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            data.put("authenticated", true);
            data.put("sub", jwt.getSubject());
            data.put("userId", jwt.getClaimAsString("user_id"));
            data.put("username", jwt.getClaimAsString("username"));
            data.put("fullName", jwt.getClaimAsString("fullName"));
            data.put("role", jwt.getClaimAsString("role"));

            Map<String, Object> claims = jwt.getClaims();
            data.put("iss", String.valueOf(claims.get("iss")));
            return ApiResponse.ok("Authenticated", data);
        } else {
            data.put("authenticated", false);
            return ApiResponse.ok("Not Authenticated", data);
        }
    }
}