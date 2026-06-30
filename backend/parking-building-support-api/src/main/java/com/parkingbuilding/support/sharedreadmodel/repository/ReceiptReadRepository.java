package com.parkingbuilding.support.sharedreadmodel.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.parkingbuilding.support.sharedreadmodel.entity.ReceiptReadEntity;

public interface ReceiptReadRepository extends JpaRepository<ReceiptReadEntity, Long> {
    
}
