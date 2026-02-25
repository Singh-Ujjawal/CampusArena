package com.campusarena.eventhub.contest.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "contests")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Contest {
    @Id
    private String id;
    private String title;
    private Instant startTime;
    private Instant endTime;
    private String clubId; // Reference to Club ID
    private List<String> problemIds;
    private List<String> facultyCoordinators;
    private List<String> studentCoordinators;
}
