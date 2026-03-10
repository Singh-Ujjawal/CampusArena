package com.campusarena.eventhub.registration.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EvaluationCriterion {
    private String id;
    private String name;
    private Double maxMarks;
}
