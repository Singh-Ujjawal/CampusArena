package com.campusarena.eventhub.user.dto;

import com.campusarena.eventhub.user.model.Branch;
import com.campusarena.eventhub.user.model.Course;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.index.Indexed;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRequest {
    @NotBlank(message = "Username is required")
    private String username;
    
    private String password;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotBlank(message = "Father name is required")
    private String fatherName;
    
    @NotNull(message = "Course is required")
    private Course course;
    
    private Branch branch;
    @Indexed(unique = true)
    private String rollNumber;
    @Indexed(unique = true)
    private String phoneNumber;
    
    private String section;
    
    @NotBlank(message = "Session is required")
    @Pattern(regexp = "^20\\d{2}-\\d{2}$", message = "Session must be in YYYY-YY format (e.g., 2025-26)")
    private String session;
    @Indexed(unique = true)
    private String leetCodeUsername;
}

