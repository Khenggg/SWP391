package com.parkingbuilding.support.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
public class AuthCheckController {

    @GetMapping("/auth-check")
    public Map<String, Object> authCheck(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            response.put("authenticated", true);
            response.put("userId", jwt.getClaimAsString("user_id"));
            response.put("username", jwt.getClaimAsString("username"));
            response.put("role", jwt.getClaimAsString("role"));
            response.put("fullName", jwt.getClaimAsString("fullName"));
        } else {
            response.put("authenticated", false);
        }
        return response;
    }
}