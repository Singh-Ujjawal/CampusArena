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
    private String subClubName;
    private String objective;
    private String description;
    private List<ParticipantInfo> participants;
    private List<ParticipantInfo> winners;
    private List<String> socialMediaLinks;
    private Instant createdAt;
    private String createdBy;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ParticipantInfo {
        private String name;
        private String rollNumber;
        private String course;
        private String branch;
        private String section;
        private String score; // Formatted as "85/100" or similar
    }
}
