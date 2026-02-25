package com.campusarena.eventhub.contest.dto;

import com.campusarena.eventhub.contest.model.TestCase;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProblemRequest {
    private String title;
    private String description;
    private String difficulty;
    private List<TestCase> testCases;
}
