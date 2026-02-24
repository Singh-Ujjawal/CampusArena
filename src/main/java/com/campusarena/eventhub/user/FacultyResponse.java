package com.campusarena.eventhub.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FacultyResponse {
    private String username;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
    private Course course;
    private String phoneNumber;
    private Roles role;
}
