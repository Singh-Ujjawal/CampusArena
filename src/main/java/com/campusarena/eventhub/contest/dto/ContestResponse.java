package com.campusarena.eventhub.contest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ContestResponse {
    private String id;
    private String title;
    private Instant startTime;
    private Instant endTime;
    private String clubId;
    private List<String> problemIds;
    private List<String> facultyCoordinators;
    private List<String> studentCoordinators;
    private String status;
}
