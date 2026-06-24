package com.parkingbuilding.support.dto.response;

import java.util.List;

public record  RuleItemResponse (
    String group,
    String title,
    List<String> content){}
