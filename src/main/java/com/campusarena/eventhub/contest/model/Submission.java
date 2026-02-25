package com.campusarena.eventhub.contest.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "submissions")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Submission {
    @Id
    private String id;
    private String userId;
    private String contestId;
    private String problemId;
    private String code;
    private String language;
    private String verdict; // PENDING, ACCEPTED, etc.
    private Integer score;
    private Instant submittedAt;
    private Long executionTime;
    private Integer passedTestCases;
    private Integer totalTestCases;
    private Integer failedTestCase;
    private String compileError;
    private String stderr;
}
