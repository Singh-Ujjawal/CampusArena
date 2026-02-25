package com.campusarena.eventhub.event.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RemainingTimeResponseDTO {
    private long remainingSeconds;
    private String status;
    private Instant startTime;
    private Instant eventEndTime;
}
