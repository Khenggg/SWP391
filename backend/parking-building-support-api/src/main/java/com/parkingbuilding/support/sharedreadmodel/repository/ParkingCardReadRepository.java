package com.parkingbuilding.support.sharedreadmodel.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.parkingbuilding.support.sharedreadmodel.entity.ParkingCardReadEntity;

@Repository
public interface ParkingCardReadRepository
        extends ReadOnlyRepository<ParkingCardReadEntity, Long> {

    Optional<ParkingCardReadEntity> findByCardCode(String cardCode);

    Optional<ParkingCardReadEntity> findByQrToken(String qrToken);

    List<ParkingCardReadEntity> findByStatus(String status);

    long countByStatus(String status);

}
