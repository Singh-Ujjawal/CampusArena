package com.campusarena.eventhub.registration.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document(collection = "feedback_submissions")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackSubmission {
    @Id
    private String id;
    private String formId; // Link to RegistrationForm
    private String userId;
    private String username;
    private Map<String, Object> answers;
    private Instant submittedAt;
}
