package com.campusarena.eventhub.event.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminEventAnalyticsDTO {
    private long totalRegistrations;
    private long totalAttempts;
    private long totalAbsent;
    private double averageScore;
    private double highestScore;
    private double lowestScore;
    private double passPercentage;
    private List<TopPerformerDTO> topPerformers;
}
