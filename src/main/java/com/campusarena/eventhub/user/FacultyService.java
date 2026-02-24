package com.campusarena.eventhub.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FacultyService {

    private final UserRepository userRepository;

    public FacultyResponse updateFaculty(FacultyRequest facultyRequest,String userId) {
        User user = userRepository.findByid(userId);
        if (user == null) {
            return null;
        }
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
        User user = userRepository.findByid(userId);
        if (user == null) {
            return null;
        }
        return mapToFacultyResponse(user);
    }

    public FacultyResponse mapToFacultyResponse(User  user) {
        FacultyResponse facultyResponse = new FacultyResponse();
        facultyResponse.setUsername(user.getUsername());
        facultyResponse.setPassword(user.getPassword());
        facultyResponse.setCourse(user.getCourse());
        facultyResponse.setFirstName(user.getFirstName());
        facultyResponse.setLastName(user.getLastName());
        facultyResponse.setEmail(user.getEmail());
        facultyResponse.setPhoneNumber(user.getPhoneNumber());
        facultyResponse.setRole(user.getRole());
        return facultyResponse;
    }

}
