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

import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CardLookupService {

    private final ParkingCardReadRepository cardRepo;
    private final ParkingSessionReadRepository sessionRepo;

    public ActiveSessionResponse getActiveSession(String qrToken) {

        ParkingCardReadEntity card = cardRepo.findByQrToken(qrToken)
                .orElseThrow(() -> new RuntimeException("Card not found"));

        ParkingSession session = sessionRepo
                .findByCardIdAndStatus(card.getId(), "ACTIVE")
                .orElseThrow(() -> new RuntimeException("No active session"));

        return map(card, session);
    }

    private ActiveSessionResponse map(ParkingCardReadEntity card, ParkingSession session) {

        return ActiveSessionResponse.builder()
                .cardCode(card.getCardCode())
                .sessionCode(session.getSessionCode())
                .maskedPlateNumber(maskPlate(session.getPlateNumber()))
                .vehicleType(String.valueOf(session.getVehicleTypeId()))
                .entryTime(session.getEntryTime())
                .temporaryFeePreview(calculateFee(session))
                .status(session.getStatus())
                .build();
    }

    private String maskPlate(String plate) {
        if (plate == null || plate.length() < 6) return "****";

        String[] parts = plate.split("-");
        if (parts.length != 2) return "****";

        String prefix = parts[0];
        String number = parts[1];

        return prefix + "-***" + number.substring(number.length() - 2);
    }

    private BigDecimal calculateFee(ParkingSession session) {
        long minutes = Duration.between(session.getEntryTime(), Instant.now()).toMinutes();

        return BigDecimal.valueOf((minutes / 60.0) * 1000);
    }
}
