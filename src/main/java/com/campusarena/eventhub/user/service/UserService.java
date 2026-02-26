package com.campusarena.eventhub.user.service;

import com.campusarena.eventhub.exception.ResourceNotFoundException;
import com.campusarena.eventhub.exception.UserValidationException;
import com.campusarena.eventhub.user.dto.UserRequest;
import com.campusarena.eventhub.user.dto.UserResponse;
import com.campusarena.eventhub.user.model.Roles;
import com.campusarena.eventhub.user.model.User;
import com.campusarena.eventhub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse insertUser(UserRequest userRequest) {
        validateUniqueness(userRequest, null);
        User user = new User();
        copyProperties(userRequest, user);
        user.setRole(Roles.USER);
        return mapToUserResponse(userRepository.save(user));
    }

    public UserResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapToUserResponse(user);
    }

    public UserResponse updateUser(UserRequest userRequest, String userId) {
        validateUniqueness(userRequest, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        copyProperties(userRequest, user);
        return mapToUserResponse(userRepository.save(user));
    }

    private void validateUniqueness(UserRequest request, String userId) {
        Map<String, String> errors = new HashMap<>();

        if (userId == null) {
            // Creation
            if (userRepository.existsByUsername(request.getUsername())) {
                errors.put("username", "Username already exists");
            }
            if (userRepository.existsByEmail(request.getEmail())) {
                errors.put("email", "Email already exists");
            }
            if (request.getRollNumber() != null && userRepository.existsByRollNumber(request.getRollNumber())) {
                errors.put("rollNumber", "Roll number already exists");
            }
            if (request.getPhoneNumber() != null && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                errors.put("phoneNumber", "Phone number already exists");
            }
            if (request.getLeetCodeUsername() != null && !request.getLeetCodeUsername().isBlank() 
                    && userRepository.existsByLeetCodeUsername(request.getLeetCodeUsername())) {
                errors.put("leetCodeUsername", "LeetCode username already exists");
            }
        } else {
            // Update
            if (userRepository.existsByUsernameAndIdNot(request.getUsername(), userId)) {
                errors.put("username", "Username already exists");
            }
            if (userRepository.existsByEmailAndIdNot(request.getEmail(), userId)) {
                errors.put("email", "Email already exists");
            }
            if (request.getRollNumber() != null && userRepository.existsByRollNumberAndIdNot(request.getRollNumber(), userId)) {
                errors.put("rollNumber", "Roll number already exists");
            }
            if (request.getPhoneNumber() != null && userRepository.existsByPhoneNumberAndIdNot(request.getPhoneNumber(), userId)) {
                errors.put("phoneNumber", "Phone number already exists");
            }
            if (request.getLeetCodeUsername() != null && !request.getLeetCodeUsername().isBlank() 
                    && userRepository.existsByLeetCodeUsernameAndIdNot(request.getLeetCodeUsername(), userId)) {
                errors.put("leetCodeUsername", "LeetCode username already exists");
            }
        }

        if (!errors.isEmpty()) {
            throw new UserValidationException(errors);
        }
    }

    private void copyProperties(UserRequest source, User target) {
        target.setFirstName(source.getFirstName());
        target.setLastName(source.getLastName());
        target.setEmail(source.getEmail());
        if (source.getPassword() != null && !source.getPassword().isBlank()) {
            target.setPassword(passwordEncoder.encode(source.getPassword()));
        }
        target.setBranch(source.getBranch());
        target.setUsername(source.getUsername());
        target.setFatherName(source.getFatherName());
        target.setCourse(source.getCourse());
        target.setRollNumber(source.getRollNumber());
        target.setPhoneNumber(source.getPhoneNumber());
        target.setSection(source.getSection());
        target.setSession(source.getSession());
        target.setLeetCodeUsername(source.getLeetCodeUsername());
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

    public UserResponse getUserByUsername(String username) {
        User user=userRepository.findByUsername(username).orElse(null);
        if(user==null){
            throw new ResourceNotFoundException("User not found with username: " + username);
        }
        return mapToUserResponse(user);
    }
}
