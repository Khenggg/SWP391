
package com.parkingbuilding.support.common.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.parkingbuilding.support.common.response.ErrorResponse;

import jakarta.persistence.EntityNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {

                Map<String, String> errors = new HashMap<>();

                ex.getBindingResult().getFieldErrors()
                                .forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ErrorResponse.of(
                                                "Validation Failed",
                                                400,
                                                errors));
        }

        @ExceptionHandler(EntityNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(ErrorResponse.of(
                                                ex.getMessage(),
                                                404,
                                                null));
        }

        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<ErrorResponse> handleRuntime(RuntimeException ex) {

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ErrorResponse.of(
                                                ex.getMessage(),
                                                400,
                                                null));
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleAll(Exception ex) {

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ErrorResponse.of(
                                                "Internal Server Error",
                                                500,
                                                null));
        }

}