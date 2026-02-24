package com.campusarena.eventhub.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private String username;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
    private String fatherName;
    private Course course;
    private Branch branch;
    private String rollNumber;
    private String phoneNumber;
    private String section;
    private String session;
    private String leetCodeUsername;
    private Roles role;
}
