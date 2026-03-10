package com.campusarena.eventhub.registration.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EvaluationMark {
    private String criterionId;
    private String criterionName;
    private Double marksObtained;
}
