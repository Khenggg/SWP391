package com.parkingbuilding.support.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkingbuilding.support.dto.response.ActiveSessionResponse;
import com.parkingbuilding.support.sharedreadmodel.entity.ParkingCardReadEntity;
import com.parkingbuilding.support.sharedreadmodel.entity.ParkingSession;
import com.parkingbuilding.support.sharedreadmodel.repository.ParkingCardReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.ParkingSessionReadRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CardLookupService {

    private final ParkingCardReadRepository cardRepo;
    private final ParkingSessionReadRepository sessionRepo;

    public ActiveSessionResponse getActiveSession(String qrToken) {

        ParkingCardReadEntity card = cardRepo.findByQrToken(qrToken)
                .orElseThrow(() -> new EntityNotFoundException("Card not found"));

        if (!"IN_USE".equals(card.getStatus())) {
            throw new EntityNotFoundException("Card not found");
        }

        ParkingSession session = sessionRepo
                .findByCardIdAndStatus(card.getId(), "ACTIVE")
                .orElseThrow(() -> new EntityNotFoundException("No active session"));

        return map(card, session);
    }

    private ActiveSessionResponse map(
            ParkingCardReadEntity card,
            ParkingSession session) {

        return ActiveSessionResponse.builder()
                .cardCode(card.getCardCode())
                .sessionCode(session.getSessionCode())
                .maskedPlateNumber(maskPlate(session.getPlateNumber()))
                .vehicleType(
                        session.getVehicleType().getId() != null
                                ? session.getVehicleType().getName()
                                : null)
                .entryTime(session.getEntryTime())
                .temporaryFeePreview(calculateFee(session))
                .status(session.getStatus())
                .build();
    }

    private String maskPlate(String plate) {

        if (plate == null || plate.isBlank()) {
            return "UNKNOWN";
        }

        String[] parts = plate.split("-");

        if (parts.length != 2) {
            return "****";
        }

        return parts[0] + "-****";
    }

    private BigDecimal calculateFee(ParkingSession session) {

        if (session.getEntryTime() == null) {
            return BigDecimal.ZERO;
        }

        long hours = Duration
                .between(session.getEntryTime(), Instant.now())
                .toHours();

        return BigDecimal.valueOf(hours * 1000);
    }
}
