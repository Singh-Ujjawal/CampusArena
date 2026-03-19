package com.campusarena.eventhub.contest.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Size;
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
    @Size(min = 6, max = 6, message = "Password must be exactly 6 digits")
    private String accessPassword;
    private String subClubName;
    private List<String> problemIds;
    private List<String> facultyCoordinators;
    private List<String> studentCoordinators;
    private Boolean registrationRequired = true;
    private String createdBy;
}

