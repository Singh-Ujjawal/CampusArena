package com.campusarena.eventhub.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserActivityDTO {
    private List<McqActivityDTO> mcqActivities;
    private List<ContestActivityDTO> contestActivities;
    private List<RegistrationActivityDTO> registrationActivities;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class McqActivityDTO {
        private String eventId;
        private String title;
        private String registeredAt;
        private String submittedAt;
        private String status;
        private Double score;
        private Double totalMarks;
        private Integer rank;
        private String clubName;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ContestActivityDTO {
        private String contestId;
        private String title;
        private int problemsSolved;
        private int totalProblems;
        private double totalScore;
        private String lastSubmissionTime;
        private Integer rank;
        private String clubName;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RegistrationActivityDTO {
        private String formId;
        private String title;
        private String registeredAt;
        private String status;
        private String evaluationStatus;
        private Double score;
        private Double totalMarks;
        private String clubName;
    }
}
