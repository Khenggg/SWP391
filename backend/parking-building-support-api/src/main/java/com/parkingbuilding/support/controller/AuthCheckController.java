package com.parkingbuilding.support.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/support")
public class AuthCheckController {

    @GetMapping("/auth-check")
    public Object authCheck(Authentication authentication) {
        return authentication;
    }
}