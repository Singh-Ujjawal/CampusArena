package com.campusarena.eventhub.contest.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "problems")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Problem {
    @Id
    private String id;
    private String title;
    private String description;
    private String difficulty;
    private List<TestCase> testCases;
    private String createdBy;
}
