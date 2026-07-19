package com.parkingbuilding.support.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkingbuilding.support.dto.request.CreateNotificationRequest;
import com.parkingbuilding.support.enums.NotificationPriority;
import com.parkingbuilding.support.enums.NotificationType;
import com.parkingbuilding.support.sharedreadmodel.repository.PaymentReadRepository;

import lombok.RequiredArgsConstructor;

@Transactional
@RequiredArgsConstructor
@Service
public class PaymentService {
    private final PaymentReadRepository paymentReadRepository;
    private final NotificationService notificationService;

    public PaymentResponse createPayment(CreatePaymentRequest request) {

        PaymentEntity payment = new PaymentEntity();

        // xử lý payment

        paymentReadRepository.save(payment);

        notificationService.createNotification(
                CreateNotificationRequest.builder()
                        .userId(payment.getUserId())
                        .paymentId(payment.getId())
                        .title("Payment Successful")
                        .content("Your payment has been completed successfully.")
                        .type(NotificationType.PAYMENT)
                        .priority(NotificationPriority.NORMAL)
                        .build());

        return 
    }
}
