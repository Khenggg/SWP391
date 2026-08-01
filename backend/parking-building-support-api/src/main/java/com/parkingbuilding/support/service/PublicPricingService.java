package com.parkingbuilding.support.service;


import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkingbuilding.support.dto.response.PublicPricingResponse;
import com.parkingbuilding.support.sharedreadmodel.entity.VehicleTypeReadEntity;
import com.parkingbuilding.support.sharedreadmodel.repository.PricingRuleReadRepository;
import com.parkingbuilding.support.sharedreadmodel.repository.VehicleTypeReadRepository;
import lombok.RequiredArgsConstructor;

@Transactional(readOnly = true)
@Service
@RequiredArgsConstructor
public class PublicPricingService {

    private final PricingRuleReadRepository pricingRuleRepository;
    private final VehicleTypeReadRepository vehicleTypeRepository;

    public List<PublicPricingResponse> getPricing() {

        Map<Long, VehicleTypeReadEntity> vehicleTypeMap =
                vehicleTypeRepository.findByIsActiveTrue()
                        .stream()
                        .collect(Collectors.toMap(
                                VehicleTypeReadEntity::getId,
                                vehicleType -> vehicleType
                        ));

        return pricingRuleRepository.findByStatus("ACTIVE")
                .stream()
                .map(rule -> PublicPricingResponse.builder()
                        .pricingRuleId(rule.getId())
                        .vehicleTypeId(rule.getVehicleTypeId())
                        .vehicleTypeName(
                                vehicleTypeMap.containsKey(rule.getVehicleTypeId())
                                        ? vehicleTypeMap.get(rule.getVehicleTypeId()).getName()
                                        : null
                        )
                        .requiresSlot(
                                vehicleTypeMap.containsKey(rule.getVehicleTypeId())
                                        ? vehicleTypeMap.get(rule.getVehicleTypeId()).getRequiresSlot()
                                        : null
                        )
                        .dayPrice(rule.getDayPrice())
                        .nightPrice(rule.getNightPrice())
                        .monthlyPrice(rule.getMonthlyPrice())
                        .reservationHourlyPrice(
                                rule.getReservationHourlyPrice()
                        )
                        .maxReservationHours(rule.getMaxReservationHours())
                        .lostCardFee(rule.getLostCardFee())
                        .build())
                .toList();
    }
}
