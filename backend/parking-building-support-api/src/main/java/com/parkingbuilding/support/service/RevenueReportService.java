package com.parkingbuilding.support.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkingbuilding.support.dto.request.RevenueReportRequest;
import com.parkingbuilding.support.dto.response.RevenueReportResponse;
import com.parkingbuilding.support.sharedreadmodel.repository.PaymentReadRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)

public class RevenueReportService {

    private final PaymentReadRepository paymentRepository;

    public RevenueReportResponse getReport(
            RevenueReportRequest request) {

        return RevenueReportResponse.builder()
                .from(request.getFrom())
                .to(request.getTo())
                .totalRevenue(
                        paymentRepository.sumRevenueBetween(
                                request.getFrom(),
                                request.getTo()))
                .totalPayments(
                        paymentRepository.countByPaidAtBetween(
                                request.getFrom(),
                                request.getTo()))
                .paidPayments(
                        paymentRepository.countByStatusAndPaidAtBetween(
                                "PAID",
                                request.getFrom(),
                                request.getTo()))
                .pendingPayments(
                        paymentRepository.countByStatusAndCreatedAtBetween(
                                "PENDING",
                                request.getFrom(),
                                request.getTo()))
                .cancelledPayments(
                        paymentRepository.countByStatusAndCreatedAtBetween(
                                "CANCELLED",
                                request.getFrom(),
                                request.getTo()))
                .build();
    }
}
