package com.campusarena.eventhub.registration.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Document(collection = "registration_responses")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegistrationResponse {
    @Id
    private String id;
    private String formId;
    private String userId;
    private String username;
    private String rollNumber;
    private String name; // firstname + lastname
    private String email;
    private String phoneNumber;
    private String course;
    private String branch;
    private String section;
    private Map<String, Object> answers;
    private Instant submittedAt;
    private String paymentProofUrl; // If payment was required
    private String status; // e.g., PENDING, APPROVED, REJECTED
    
    // Evaluation Results
    private List<EvaluationMark> evaluationMarks;
    private Double totalEvaluationMarks;
    private Double maxPossibleMarks;
    private String evaluationStatus; // e.g., PENDING, GRADED
    private String evaluationFeedback;
    private String gradedBy;
    private Instant gradedAt;
}
