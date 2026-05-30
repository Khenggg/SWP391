package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.sharedreadmodel.entity.PricingRuleReadEntity;

@Repository
public interface PricingRuleReadRepository
        extends JpaRepository<PricingRuleReadEntity, Long> {

    List<PricingRuleReadEntity> findByVehicleTypeId(Long vehicleTypeId);

    List<PricingRuleReadEntity> findByStatus(String status);

}