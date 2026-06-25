package com.parkingbuilding.support.controller;

import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.dto.response.ActiveSessionResponse;
import com.parkingbuilding.support.service.CardLookupService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportCardLookupController {

    private final CardLookupService service;

    @GetMapping("/{qrToken}/active-session")
    public ApiResponse<ActiveSessionResponse> getActiveSession(
            @PathVariable String qrToken,
            Authentication authentication
    ) {
        return ApiResponse.ok(
                service.getActiveSession(qrToken)
        );
    }
}
