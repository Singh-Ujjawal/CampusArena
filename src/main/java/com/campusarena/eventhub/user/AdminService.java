package com.campusarena.eventhub.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;

    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserResponse> userResponseList = new ArrayList<>();
        for (User user : users) {
            if(user.getRole().equals(Roles.USER)) {
                userResponseList.add(mapToUserResponse(user));
            }
        }
        return userResponseList;
    }

    public List<FacultyResponse> getAllFaculties() {
        List<User> users = userRepository.findAll();
        List<FacultyResponse> facultyResponseList = new ArrayList<>();
        for (User user : users) {
            if(user.getRole().equals(Roles.FACULTY)) {
                facultyResponseList.add(mapToFacultyResponse(user));
            }
        }
        return facultyResponseList;
    }

    public FacultyResponse insertFaculty(FacultyRequest facultyRequest) {
        User user = new User();
        user.setRole(Roles.FACULTY);
        user.setUsername(facultyRequest.getUsername());
        user.setPassword(facultyRequest.getPassword());
        user.setEmail(facultyRequest.getEmail());
        user.setFirstName(facultyRequest.getFirstName());
        user.setLastName(facultyRequest.getLastName());
        user.setPhoneNumber(facultyRequest.getPhoneNumber());
        user.setCourse(facultyRequest.getCourse());
        return mapToFacultyResponse(userRepository.save(user));
    }


    private FacultyResponse mapToFacultyResponse(User user) {
        FacultyResponse facultyResponse = new FacultyResponse();
        facultyResponse.setUsername(user.getUsername());
        facultyResponse.setPassword(user.getPassword());
        facultyResponse.setEmail(user.getEmail());
        facultyResponse.setFirstName(user.getFirstName());
        facultyResponse.setLastName(user.getLastName());
        facultyResponse.setPhoneNumber(user.getPhoneNumber());
        facultyResponse.setCourse(user.getCourse());
        facultyResponse.setRole(user.getRole());
        return facultyResponse;
    }

    public UserResponse getUserById(String userId) {
        User user = userRepository.findByid(userId);
        if (user == null) {
            return null;
        }
        return mapToUserResponse(user);
    }

    public FacultyResponse getFacultyById(String userId) {
        User faculty = userRepository.findByid(userId);
        if (faculty == null) {
            return null;
        }
        return mapToFacultyResponse(faculty);
    }

    public boolean deleteUserById(String userId) {
        User user = userRepository.findByid(userId);
        if (user == null) {
            return false;
        }
        userRepository.deleteById(userId);
        return true;
    }

    public UserResponse mapToUserResponse(User user) {
        UserResponse userResponse = new UserResponse();
        userResponse.setUsername(user.getUsername());
        userResponse.setPassword(user.getPassword());
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setFatherName(user.getFatherName());
        userResponse.setCourse(user.getCourse());
        userResponse.setBranch(user.getBranch());
        userResponse.setRollNumber(String.valueOf(user.getRollNumber()));
        userResponse.setPhoneNumber(String.valueOf(user.getPhoneNumber()));
        userResponse.setSection(user.getSection());
        userResponse.setSession(String.valueOf(user.getSession()));
        userResponse.setLeetCodeUsername(String.valueOf(user.getLeetCodeUsername()));
        userResponse.setRole(user.getRole());
        return userResponse;
    }
}
