package com.parkingbuilding.support.sharedreadmodel.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.parkingbuilding.support.sharedreadmodel.entity.LostCardCaseReadEntity;

public interface LostCardCaseReadRepository extends JpaRepository<LostCardCaseReadEntity, Long> {

    long countByStatus(String status);
}
