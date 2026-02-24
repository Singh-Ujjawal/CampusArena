package com.campusarena.eventhub.user;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.experimental.Accessors;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRequest {
    @NotBlank
    private String username;
    @NotBlank
    private String password;
    @NotBlank
    @Email
    private String email;
    @NotBlank
    private String firstName;
    @NotBlank
    private String lastName;
    @NotBlank
    private String fatherName;
    @NotBlank
    private Course course;
    private Branch branch;
    @NotBlank
    private String rollNumber;
    @NotBlank
    private String phoneNumber;
    private String section;
    @NotBlank
    @Pattern(regexp = "^20\\d{2}-\\d{2}$", message = "Session must be in YYYY-YY format (e.g., 2025-26)")
    private String session;
    private String leetCodeUsername;
}
