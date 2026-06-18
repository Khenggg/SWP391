package com.parkingbuilding.support.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parkingbuilding.support.common.ApiResponse;
import com.parkingbuilding.support.service.PublicRuleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicRuleController {
    private final PublicRuleService publicRuleService;

    @GetMapping("/rules")
    public ApiResponse<?> getRules(){
        return ApiResponse.ok(
            publicRuleService.getRules()
        );
    }

}
