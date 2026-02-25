package com.campusarena.eventhub.contest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RunResponse {
    private String verdict;
    private Long executionTime;
    private Integer passedTestCases;
    private Integer totalTestCases;
    private Integer failedTestCase;
    private String compileError;
    private String stderr;
    private String stdout;
}
