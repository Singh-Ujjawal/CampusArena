package com.campusarena.eventhub.registration.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Document(collection = "registration_forms")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class RegistrationForm {
    @Id
    private String id;
    private String title;
    private String description;
    private List<Question> questions;
    private Instant startTime;
    private Instant endTime;
    private String imageUrl;        // Cloudinary secure URL (HTTPS)
    private String imagePublicId;   // Cloudinary public ID for deletion
    private String noticeUrl;       // Cloudinary secure URL for notice
    private String noticePublicId;  // Cloudinary public ID for notice
    private String posterUrl;       // Cloudinary secure URL for poster
    private String posterPublicId;  // Cloudinary public ID for poster
    private boolean showNotice;     // Toggle to show notice to user
    private boolean showPoster;     // Toggle to show poster to user
    private String venue;           // Optional venue for the event
    private String resourcePerson;  // Optional resource person for the event
    private Boolean paymentRequired;
    private BigDecimal paymentFees;
    private boolean active;
    private Instant createdAt;
    
    // Links to other entities
    private String clubId;
    private String eventId;    // Link to MCQ event
    private String contestId;  // Link to Coding contest
    private String createdBy;
    private String subClubName; // Link to specific Sub-Club
    
    // Evaluation Criteria (for external events like festivals, seminars, etc.)
    private List<EvaluationCriterion> evaluationCriteria;

    // Feedback Configuration
    private Boolean feedbackEnabled;
    private List<Question> feedbackQuestions;

    // Social Media Links
    private List<SocialMediaLink> socialMediaLinks;
}
