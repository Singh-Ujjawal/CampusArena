package com.campusarena.eventhub.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EventLeaderboardEntry {
    private String userId;
    private String username;
    private String rollNumber;
    private double score;
    private int correctAnswers;
    private int attempted;
    private Instant submittedAt;
}
