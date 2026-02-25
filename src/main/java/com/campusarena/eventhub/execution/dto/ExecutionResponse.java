package com.campusarena.eventhub.execution.dto;

import com.campusarena.eventhub.execution.model.ExecutionStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExecutionResponse {
    private String stdout;
    private String stderr;
    private String compileError;
    private long executionTime;       // milliseconds
    private ExecutionStatus status;
    private Integer failedTestCase;
    private Integer passedTestCases;
    private Integer totalTestCases;

    public static ExecutionResponse error(String message) {
        return ExecutionResponse.builder()
                .stderr(message)
                .status(ExecutionStatus.RUNTIME_ERROR)
                .executionTime(0)
                .passedTestCases(0)
                .totalTestCases(0)
                .build();
    }
}
