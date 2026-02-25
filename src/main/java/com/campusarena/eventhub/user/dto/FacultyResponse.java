package com.campusarena.eventhub.user.dto;

import com.campusarena.eventhub.user.model.Course;
import com.campusarena.eventhub.user.model.Roles;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FacultyResponse {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Course course;
    private String phoneNumber;
    private Roles role;
}
