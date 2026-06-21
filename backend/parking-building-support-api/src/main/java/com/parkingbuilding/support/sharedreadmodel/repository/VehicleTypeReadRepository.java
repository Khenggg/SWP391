package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.sharedreadmodel.entity.VehicleTypeReadEntity;

@Repository
public interface VehicleTypeReadRepository extends ReadOnlyRepository<VehicleTypeReadEntity, Long> {

    List<VehicleTypeReadEntity> findByIsActiveTrue();
}