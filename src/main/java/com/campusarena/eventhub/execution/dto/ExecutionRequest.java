package com.campusarena.eventhub.execution.dto;

import com.campusarena.eventhub.execution.model.Language;
import lombok.Data;

import java.util.List;

@Data
public class ExecutionRequest {
    private String sourceCode;
    private int timeLimit;        // seconds
    private Language language;
    private List<ExecutionTestCase> testCases;
}
