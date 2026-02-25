package com.campusarena.eventhub.user.controller;

import com.campusarena.eventhub.user.dto.UserRequest;
import com.campusarena.eventhub.user.dto.UserResponse;
import com.campusarena.eventhub.user.dto.UserActivityDTO;
import com.campusarena.eventhub.user.service.AdminService;
import com.campusarena.eventhub.user.service.UserService;
import com.campusarena.eventhub.user.service.UserActivityService;
import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/user")
@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AdminService adminService;
    private final UserActivityService userActivityService;

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest userRequest) {
        UserResponse response = userService.insertUser(userRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{userid}")
    public ResponseEntity<UserResponse> updateUser(@Valid @RequestBody UserRequest userRequest, @PathVariable String userid) {
        UserResponse response = userService.updateUser(userRequest, userid);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{userid}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String userid) {
        UserResponse response = userService.getUserById(userid);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(adminService.searchUsers(query));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        adminService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@RequestHeader("Authorization") String auth) {
        // Basic auth decoding
        String base64Credentials = auth.substring("Basic ".length()).trim();
        byte[] credDecoded = java.util.Base64.getDecoder().decode(base64Credentials);
        String credentials = new String(credDecoded, java.nio.charset.StandardCharsets.UTF_8);
        final String[] values = credentials.split(":", 2);
        String username = values[0];
        
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @GetMapping("/activity")
    public ResponseEntity<UserActivityDTO> getMyActivity(@RequestHeader("Authorization") String auth) {
        String base64Credentials = auth.substring("Basic ".length()).trim();
        byte[] credDecoded = java.util.Base64.getDecoder().decode(base64Credentials);
        String credentials = new String(credDecoded, java.nio.charset.StandardCharsets.UTF_8);
        String username = credentials.split(":", 2)[0];
        UserResponse user = userService.getUserByUsername(username);
        return ResponseEntity.ok(userActivityService.getUserActivity(user.getId()));
    }

    @GetMapping("/activity/{userId}")
    public ResponseEntity<UserActivityDTO> getUserActivity(@PathVariable String userId) {
        return ResponseEntity.ok(userActivityService.getUserActivity(userId));
    }
}
