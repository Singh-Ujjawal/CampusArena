package com.campusarena.eventhub.leetcode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LcUserProfileResponse {
    private String name;
    private String leetCodeUsername;
    private long totalSolved;
    private Map<String, Long> difficultyStats;
    private Map<String, Long> topicStats;
    private LocalDateTime lastSyncTime; // when user last synced
    private Long lastSyncedTimestamp; // epoch millis for cooldown countdown
}
