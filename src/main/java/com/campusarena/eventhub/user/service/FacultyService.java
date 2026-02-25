package com.campusarena.eventhub.user.service;

import com.campusarena.eventhub.exception.ResourceNotFoundException;
import com.campusarena.eventhub.user.dto.FacultyRequest;
import com.campusarena.eventhub.user.dto.FacultyResponse;
import com.campusarena.eventhub.user.model.User;
import com.campusarena.eventhub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FacultyService {

    private final UserRepository userRepository;

    public FacultyResponse updateFaculty(FacultyRequest facultyRequest, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + userId));
        
        user.setUsername(facultyRequest.getUsername());
        user.setPassword(facultyRequest.getPassword());
        user.setCourse(facultyRequest.getCourse());
        user.setFirstName(facultyRequest.getFirstName());
        user.setLastName(facultyRequest.getLastName());
        user.setEmail(facultyRequest.getEmail());
        user.setPhoneNumber(facultyRequest.getPhoneNumber());
        
        return mapToFacultyResponse(userRepository.save(user));
    }

    public FacultyResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + userId));
        return mapToFacultyResponse(user);
    }

    public FacultyResponse mapToFacultyResponse(User user) {
        FacultyResponse facultyResponse = new FacultyResponse();
        facultyResponse.setId(user.getId());
        facultyResponse.setUsername(user.getUsername());
        facultyResponse.setCourse(user.getCourse());
        facultyResponse.setFirstName(user.getFirstName());
        facultyResponse.setLastName(user.getLastName());
        facultyResponse.setEmail(user.getEmail());
        facultyResponse.setPhoneNumber(user.getPhoneNumber());
        facultyResponse.setRole(user.getRole());
        return facultyResponse;
    }
}
