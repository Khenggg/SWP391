package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.sharedreadmodel.entity.PricingRuleReadEntity;

@Repository
public interface PricingRuleReadRepository
        extends ReadOnlyRepository<PricingRuleReadEntity, Long> {

    List<PricingRuleReadEntity> findByVehicleTypeId(Long vehicleTypeId);

    List<PricingRuleReadEntity> findByStatus(String status);

}