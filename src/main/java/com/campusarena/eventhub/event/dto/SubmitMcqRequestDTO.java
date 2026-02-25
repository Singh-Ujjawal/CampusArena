package com.campusarena.eventhub.event.dto;

import com.campusarena.eventhub.event.model.Answer;
import lombok.Data;

import java.util.List;

@Data
public class SubmitMcqRequestDTO {
    private List<Answer> answers;
}
