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

        // 1. Tìm thẻ bằng QR Token
        ParkingCardReadEntity card = cardRepo.findByQrToken(qrToken)
                .orElseThrow(() -> new RuntimeException("Card not found"));

        // 2. Chỉ cho phép thẻ đang được sử dụng
        if (!"IN_USE".equals(card.getStatus())) {
            throw new RuntimeException("Card not found");
        }

        // 3. Tìm phiên gửi xe đang hoạt động
        ParkingSession session = sessionRepo
                .findByCardIdAndStatus(card.getId(), "ACTIVE")
                .orElseThrow(() -> new RuntimeException("No active session"));

        // 4. Trả dữ liệu
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
                        session.getVehicleTypeId() == null
                        ? null
                        : session.getVehicleTypeId().toString()
                )
                .entryTime(session.getEntryTime())
                .temporaryFeePreview(calculateFee(session))
                .status(session.getStatus())
                .build();
    }

    /**
     * Ẩn toàn bộ biển số VD: 51A-12345 -> 51A-**** 59X2-88888 -> 59X2-****
     */
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

    /**
     * Tính phí tạm thời để hiển thị. Phí chính thức sẽ do .NET tính khi
     * checkout.
     */
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
