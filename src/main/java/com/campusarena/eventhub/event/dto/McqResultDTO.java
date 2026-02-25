package com.campusarena.eventhub.event.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class McqResultDTO {
    private Double score;
    private Integer correctAnswers;
    private Integer wrongAnswers;
    private Integer rank;

}
