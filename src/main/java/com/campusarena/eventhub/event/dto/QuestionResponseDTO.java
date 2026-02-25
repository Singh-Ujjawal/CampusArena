package com.campusarena.eventhub.event.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionResponseDTO {
    private String id;
    private String questionText;
    private List<String> options;
    private Double marks;
    private Double negativeMarks;
}
