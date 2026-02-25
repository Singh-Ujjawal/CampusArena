package com.campusarena.eventhub.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateQuestionDTO {
    private String questionText;
    private List<String> options;
    private Integer correctOption;
    private Double marks;
    private Double negativeMarks;
}
