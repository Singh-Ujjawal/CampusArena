package com.campusarena.eventhub.event.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "events")
public class Event {
    @Id
    private String id;
    private String title;
    private String description;
    private String type; // e.g., MCQ, CODING, SEMINAR
    private Instant startTime;
    private Instant endTime;
    private Integer durationInMinutes;
    private Boolean attendanceProcessed = false;
    private Double totalMarks;
    private String clubId; // Reference to Club ID
    private String status; // UPCOMING, LIVE, COMPLETED
    private List<String> facultyCoordinators;
    private List<String> studentCoordinators;
}
