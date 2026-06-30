package com.parkingbuilding.support.service;

import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkingbuilding.support.dto.request.TrafficReportRequest;
import com.parkingbuilding.support.dto.response.TrafficReportResponse;
import com.parkingbuilding.support.sharedreadmodel.repository.ParkingSessionReadRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)

public class TrafficReportService {

    private final ParkingSessionReadRepository repository;

    public TrafficReportResponse getReport(
            TrafficReportRequest request) {

        Instant from = request.getFrom().toInstant();
        Instant to = request.getTo().toInstant();

        return TrafficReportResponse.builder()
                .totalEntries(
                        repository.countByEntryTimeBetween(from, to))
                .totalExits(
                        repository.countByExitTimeBetween(from, to))
                .activeSessions(
                        repository.countByStatus("ACTIVE"))
                .completedSessions(
                        repository.countByStatus("COMPLETED"))
                .build();
    }
}
