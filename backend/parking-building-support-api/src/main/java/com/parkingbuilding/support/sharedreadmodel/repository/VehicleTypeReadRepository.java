package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.parkingbuilding.support.sharedreadmodel.entity.VehicleTypeReadEntity;

public interface VehicleTypeReadRepository extends JpaRepository<VehicleTypeReadEntity, Long> {

    List<VehicleTypeReadEntity> findByIsActiveTrue();
}