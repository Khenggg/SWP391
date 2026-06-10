package com.parkingbuilding.support.common.response;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(
        boolean success,
        String message,
        Map<String, String> errors,
        LocalDateTime timestamp,
        int status
) {

    public static ErrorResponse of(String message, int status, Map<String, String> errors) {
        return new ErrorResponse(
                false,
                message,
                errors,
                LocalDateTime.now(),
                status
        );
    }
}