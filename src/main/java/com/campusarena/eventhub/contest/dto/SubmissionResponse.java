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
public class SubmissionResponse {
    private String id;
    private String userId;
    private String contestId;
    private String problemId;
    private String code;
    private String language;
    private String verdict;
    private Integer score;
    private Instant submittedAt;
    private Long executionTime;
    private Integer passedTestCases;
    private Integer totalTestCases;
    private Integer failedTestCase;
    private String compileError;
    private String stderr;
}
