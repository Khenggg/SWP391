package com.parkingbuilding.support.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class CardSessionReportResponse {

    private CardSummaryResponse summary;

    private List<SessionReportItemResponse> sessions;
}
