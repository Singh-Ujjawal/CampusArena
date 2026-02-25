package com.campusarena.eventhub.contest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LeaderboardEntry {
    private String userId;
    private String username;
    private String rollNumber;
    private int totalScore;
    private int problemsSolved;
    private Instant lastSubmissionTime;
}
