package com.campusarena.eventhub.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserResponse insertUser(UserRequest userRequest) {
        User user = new User();
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        user.setEmail(userRequest.getEmail());
        user.setPassword(userRequest.getPassword());
        user.setBranch(userRequest.getBranch());
        user.setUsername(userRequest.getUsername());
        user.setPassword(userRequest.getPassword());
        user.setFatherName(userRequest.getFatherName());
        user.setCourse(userRequest.getCourse());
        user.setRollNumber(String.valueOf(userRequest.getRollNumber()));
        user.setPhoneNumber(userRequest.getPhoneNumber());
        user.setSection(userRequest.getSection());
        user.setSession(userRequest.getSession());
        user.setLeetCodeUsername(userRequest.getLeetCodeUsername());
        user.setRole(Roles.USER);
        return mapToUserResponse(userRepository.save(user));
    }

    public UserResponse getUserById(String userId) {
        User user = userRepository.findByid(userId);
        if (user == null) {
            return null;
        }
        return mapToUserResponse(user);
    }

    public UserResponse updateUser(UserRequest userRequest,String userId) {
        User user = userRepository.findByid(userId);
        if (user == null) {
            return null;
        }
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        user.setEmail(userRequest.getEmail());
        user.setPassword(userRequest.getPassword());
        user.setBranch(userRequest.getBranch());
        user.setUsername(userRequest.getUsername());
        user.setPassword(userRequest.getPassword());
        user.setFatherName(userRequest.getFatherName());
        user.setCourse(userRequest.getCourse());
        user.setRollNumber(String.valueOf(userRequest.getRollNumber()));
        user.setPhoneNumber(userRequest.getPhoneNumber());
        user.setSection(userRequest.getSection());
        user.setSession(userRequest.getSession());
        user.setLeetCodeUsername(userRequest.getLeetCodeUsername());
        return mapToUserResponse(userRepository.save(user));
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
