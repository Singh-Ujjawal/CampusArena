package com.campusarena.eventhub.execution.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExecutionTestCase {
    private String input;
    private String expectedOutput;
}
