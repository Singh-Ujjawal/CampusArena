package com.campusarena.eventhub.report.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "reports")
public class Report {
    @Id
    private String id;
    private String eventId;
    private String eventType; // QUIZ, CONTEST, REGISTRATION
    private String eventName;
    private Instant date;
    private String time;
    private String venue;
    private List<String> facultyCoordinators;
    private List<String> studentCoordinators;
    private String clubName;
    private String objective;
    private String description;
    private List<String> participants; // List of names or roll numbers
    private List<String> winners; // List of names or roll numbers
    private List<String> socialMediaLinks;
    private Instant createdAt;
    private String createdBy;
}
