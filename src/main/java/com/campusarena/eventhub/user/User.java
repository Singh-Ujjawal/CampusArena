package com.campusarena.eventhub.user;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

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
    @Min(13)
    @Max(13)
    private String rollNumber;
    @Indexed(unique = true)
    @Min(10)
    @Max(10)
    private String phoneNumber;
    private String section;
    private String session;
    @Indexed(unique = true)
    private String leetCodeUsername;
}
