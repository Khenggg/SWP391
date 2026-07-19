package com.parkingbuilding.support.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.parkingbuilding.support.dto.response.RuleItemResponse;

@Transactional(readOnly = true)
@Service
public class PublicRuleService {

    public List<RuleItemResponse> getRules() {

        return List.of(
                new RuleItemResponse(
                        "entry",
                        "Vehicle Entry",
                        List.of(
                                "Customers must receive a parking ticket/card when entering.",
                                "Vehicles without valid tickets may be refused entry.",
                                "Follow staff instructions during parking."
                        )),
                new RuleItemResponse(
                        "exit",
                        "Vehicle Exit",
                        List.of(
                                "Present parking ticket/card before leaving.",
                                "Payment must be completed before exit.",
                                "Exit barrier opens after successful validation."
                        )),
                new RuleItemResponse(
                        "lost_card",
                        "Lost Parking Card",
                        List.of(
                                "Lost cards are subject to additional verification.",
                                "A lost card fee may apply according to parking policy."
                        )),
                new RuleItemResponse(
                        "mismatch",
                        "Vehicle Information Mismatch",
                        List.of(
                                "Vehicle information must match entry records.",
                                "Security verification is required for mismatched records."
                        )),
                new RuleItemResponse(
                        "monthly_pass",
                        "Monthly Pass",
                        List.of(
                                "Monthly pass holders must use registered vehicles.",
                                "Expired passes must be renewed before entry."
                        )),
                new RuleItemResponse(
                        "payment",
                        "Payment Policy",
                        List.of(
                                "Parking fees are calculated according to pricing rules.",
                                "Cashless payment methods may be supported."
                        )));
    }
}
