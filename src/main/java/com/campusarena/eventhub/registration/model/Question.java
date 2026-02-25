package com.campusarena.eventhub.registration.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class Question {
    private String id;
    private String label;
    private QuestionType type;
    private boolean required;
    private List<String> options; // only for radio, checkbox, dropdown
}
