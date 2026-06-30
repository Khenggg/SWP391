package com.parkingbuilding.support.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkingbuilding.support.dto.response.CardSessionReportResponse;
import com.parkingbuilding.support.dto.response.CardSummaryResponse;
import com.parkingbuilding.support.dto.response.SessionReportItemResponse;
import com.parkingbuilding.support.sharedreadmodel.repository.ParkingCardReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.ParkingSessionReadRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CardSessionReportService {

    private final ParkingCardReadRepository cardRepository;

    private final ParkingSessionReadRepository sessionRepository;

    public CardSessionReportResponse getReport() {

        CardSummaryResponse summary
                = CardSummaryResponse.builder()
                        .available(cardRepository.countByStatus("AVAILABLE"))
                        .inUse(cardRepository.countByStatus("IN_USE"))
                        .lost(cardRepository.countByStatus("LOST"))
                        .damaged(cardRepository.countByStatus("DAMAGED"))
                        .inactive(cardRepository.countByStatus("INACTIVE"))
                        .build();

        List<SessionReportItemResponse> sessions
                = sessionRepository.findAll()
                        .stream()
                        .map(session
                                -> SessionReportItemResponse.builder()
                                .sessionCode(session.getSessionCode())
                                .cardId(session.getCardId())
                                .plateNumber(session.getPlateNumber())
                                .status(session.getStatus())
                                .entryTime(session.getEntryTime())
                                .build())
                        .toList();

        return CardSessionReportResponse.builder()
                .summary(summary)
                .sessions(sessions)
                .build();
    }
}
