package com.campusarena.eventhub.event.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopPerformerDTO {
    private String userId;
    private String username;
    private String rollNumber;
    private double score;
    private int rank;
}
