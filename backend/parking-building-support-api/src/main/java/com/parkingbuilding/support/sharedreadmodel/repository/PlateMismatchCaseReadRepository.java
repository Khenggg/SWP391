package com.parkingbuilding.support.sharedreadmodel.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.parkingbuilding.support.sharedreadmodel.entity.PlateMismatchCaseReadEntity;

public interface PlateMismatchCaseReadRepository extends JpaRepository<PlateMismatchCaseReadEntity, Long> {

    long countByStatus(String status);
}
