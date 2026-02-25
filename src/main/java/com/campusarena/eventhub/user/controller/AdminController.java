package com.campusarena.eventhub.user.controller;

import com.campusarena.eventhub.user.dto.FacultyRequest;
import com.campusarena.eventhub.user.dto.FacultyResponse;
import com.campusarena.eventhub.user.dto.UserResponse;
import com.campusarena.eventhub.user.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/admin")
@RestController
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/getAllUsers")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/getAllFaculties")
    public ResponseEntity<List<FacultyResponse>> getAllFaculties() {
        return ResponseEntity.ok(adminService.getAllFaculties());
    }

    @PostMapping("/insertFaculty")
    public ResponseEntity<FacultyResponse> insertFaculty(@Valid @RequestBody FacultyRequest facultyRequest) {
        FacultyResponse facultyResponse = adminService.insertFaculty(facultyRequest);
        return new ResponseEntity<>(facultyResponse, HttpStatus.CREATED);
    }

    @GetMapping("/getUserById/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String userId) {
        UserResponse userResponse = adminService.getUserById(userId);
        return new ResponseEntity<>(userResponse, HttpStatus.OK);
    }

    @GetMapping("/getFacultyById/{facultyId}")
    public ResponseEntity<FacultyResponse> getFacultyById(@PathVariable String facultyId) {
        FacultyResponse facultyResponse = adminService.getFacultyById(facultyId);
        return new ResponseEntity<>(facultyResponse, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        adminService.deleteUserById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
