package com.parkingbuilding.support.sharedreadmodel.repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.parkingbuilding.support.sharedreadmodel.entity.PaymentReadEntity;

public interface PaymentReadRepository extends JpaRepository<PaymentReadEntity, Long> {

    List<PaymentReadEntity> findByStatus(String status);

    List<PaymentReadEntity> findByPaidAtBetween(
            OffsetDateTime from,
            OffsetDateTime to);

    long countByStatus(String status);

    @Query("""
                SELECT COALESCE(SUM(p.totalAmount),0)
                FROM PaymentReadEntity p
                WHERE p.status=:status
            """)
    BigDecimal sumByStatus(@Param("status") String status);

    @Query("""
                SELECT COALESCE(SUM(p.totalAmount),0)
                FROM PaymentReadEntity p
                WHERE p.status='PAID'
                AND p.paidAt BETWEEN :from AND :to
            """)
    BigDecimal sumRevenueBetween(
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to);

    long countByPaidAtBetween(
            OffsetDateTime from,
            OffsetDateTime to);

    long countByStatusAndPaidAtBetween(
            String status,
            OffsetDateTime from,
            OffsetDateTime to);

    long countByStatusAndCreatedAtBetween(
            String status,
            OffsetDateTime from,
            OffsetDateTime to);

}
