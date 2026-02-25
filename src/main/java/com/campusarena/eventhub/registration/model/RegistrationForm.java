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
    private String paymentQrUrl;
    private Boolean paymentRequired;
    private BigDecimal paymentFees;
    private boolean active;
    private Instant createdAt;
    
    // Links to other entities
    private String clubId;
    private String eventId;    // Link to MCQ event
    private String contestId;  // Link to Coding contest
}
