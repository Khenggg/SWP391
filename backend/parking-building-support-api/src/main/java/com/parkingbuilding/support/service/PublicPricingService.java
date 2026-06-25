package com.parkingbuilding.support.service;


import java.util.ArrayList;
import java.util.HashMap;
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

        List<VehicleTypeReadEntity> vehicleTypes =
                vehicleTypeRepository.findByIsActiveTrue();

        Map<Long, String> vehicleTypeMap = new HashMap<>();

        for (VehicleTypeReadEntity vehicleType : vehicleTypes) {

            vehicleTypeMap.put(
                    vehicleType.getId(),
                    vehicleType.getName()
            );
        }

        var pricingRules =
                pricingRuleRepository.findByStatus("ACTIVE");

        List<PublicPricingResponse> responses =
                new ArrayList<>();

        for (var rule : pricingRules) {

            PublicPricingResponse response =
                    PublicPricingResponse.builder()
                            .pricingRuleId(rule.getId())
                            .vehicleTypeId(rule.getVehicleTypeId())
                            .vehicleTypeName(
                                    vehicleTypeMap.get(
                                            rule.getVehicleTypeId()
                                    )
                            )
                            .dayPrice(rule.getDayPrice())
                            .nightPrice(rule.getNightPrice())
                            .monthlyPrice(rule.getMonthlyPrice())
                            .reservationHourlyPrice(
                                    rule.getReservationHourlyPrice()
                            )
                            .lostCardFee(rule.getLostCardFee())
                            .build();

            responses.add(response);
        }

        return responses;
    }
}