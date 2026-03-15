package com.campusarena.eventhub.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportRequest {
    private String eventId;
    private String eventType; // QUIZ, CONTEST, REGISTRATION
    private String venue;
    private String objective;
    private List<String> socialMediaLinks;
}
