package com.campusarena.eventhub.user.service;

import com.campusarena.eventhub.exception.ResourceNotFoundException;
import com.campusarena.eventhub.user.dto.FacultyRequest;
import com.campusarena.eventhub.user.dto.FacultyResponse;
import com.campusarena.eventhub.user.dto.UserResponse;
import com.campusarena.eventhub.user.model.Roles;
import com.campusarena.eventhub.user.model.User;
import com.campusarena.eventhub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .filter(user -> Roles.USER.equals(user.getRole()))
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> searchUsers(String query) {
        String q = query.toLowerCase();
        return userRepository.findAll().stream()
                .filter(user -> Roles.USER.equals(user.getRole()))
                .filter(user -> 
                    (user.getFirstName() != null && user.getFirstName().toLowerCase().contains(q)) ||
                    (user.getLastName() != null && user.getLastName().toLowerCase().contains(q)) ||
                    (user.getEmail() != null && user.getEmail().toLowerCase().contains(q)) ||
                    (user.getRollNumber() != null && user.getRollNumber().toLowerCase().contains(q)) ||
                    (user.getUsername() != null && user.getUsername().toLowerCase().contains(q))
                )
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public List<FacultyResponse> getAllFaculties() {
        return userRepository.findAll().stream()
                .filter(user -> Roles.FACULTY.equals(user.getRole()))
                .map(this::mapToFacultyResponse)
                .collect(Collectors.toList());
    }

    public FacultyResponse insertFaculty(FacultyRequest facultyRequest) {
        User user = new User();
        user.setRole(Roles.FACULTY);
        user.setUsername(facultyRequest.getUsername());
        user.setPassword(passwordEncoder.encode(facultyRequest.getPassword()));
        user.setEmail(facultyRequest.getEmail());
        user.setFirstName(facultyRequest.getFirstName());
        user.setLastName(facultyRequest.getLastName());
        user.setPhoneNumber(facultyRequest.getPhoneNumber());
        user.setCourse(facultyRequest.getCourse());
        return mapToFacultyResponse(userRepository.save(user));
    }

    private FacultyResponse mapToFacultyResponse(User user) {
        FacultyResponse facultyResponse = new FacultyResponse();
        facultyResponse.setId(user.getId());
        facultyResponse.setUsername(user.getUsername());
        facultyResponse.setEmail(user.getEmail());
        facultyResponse.setFirstName(user.getFirstName());
        facultyResponse.setLastName(user.getLastName());
        facultyResponse.setPhoneNumber(user.getPhoneNumber());
        facultyResponse.setCourse(user.getCourse());
        facultyResponse.setRole(user.getRole());
        return facultyResponse;
    }

    public UserResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapToUserResponse(user);
    }

    public FacultyResponse getFacultyById(String facultyId) {
        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + facultyId));
        return mapToFacultyResponse(faculty);
    }

    public void deleteUserById(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }

    public UserResponse mapToUserResponse(User user) {
        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setUsername(user.getUsername());
        userResponse.setPassword(null);
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setFatherName(user.getFatherName());
        userResponse.setCourse(user.getCourse());
        userResponse.setBranch(user.getBranch());
        userResponse.setRollNumber(user.getRollNumber());
        userResponse.setPhoneNumber(user.getPhoneNumber());
        userResponse.setSection(user.getSection());
        userResponse.setSession(user.getSession());
        userResponse.setLeetCodeUsername(user.getLeetCodeUsername());
        userResponse.setRole(user.getRole());
        return userResponse;
    }
}
