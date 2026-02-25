package com.campusarena.eventhub.user.model;

import com.campusarena.eventhub.user.model.Roles;
import com.campusarena.eventhub.user.model.Course;
import com.campusarena.eventhub.user.model.Branch;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    private String id;
    @Indexed(unique = true)
    private String username;
    private String password;
    @Indexed(unique = true)
    private String email;
    private Roles role;
    private String firstName;
    private String lastName;
    private String fatherName;
    private Course course;
    private Branch branch;
    @Indexed(unique = true)
    private String rollNumber;
    @Indexed(unique = true)
    private String phoneNumber;
    private String section;
    private String session;
    @Indexed(unique = true)
    private String leetCodeUsername;
    private Long lastSyncedTimestamp;   // epoch millis — used for sync cooldown
    private LocalDateTime lastSyncTime; // human-readable last sync time
}
