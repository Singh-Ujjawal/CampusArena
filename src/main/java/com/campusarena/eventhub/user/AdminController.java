package com.campusarena.eventhub.user;

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
    public ResponseEntity<FacultyResponse> insertFaculty(@RequestBody FacultyRequest facultyRequest) {
        FacultyResponse facultyResponse = adminService.insertFaculty(facultyRequest);
        if (facultyResponse == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return new  ResponseEntity<>(facultyResponse, HttpStatus.OK);
    }

    @GetMapping("/getUserById/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String userId) {
        UserResponse userResponse = adminService.getUserById(userId);
        if (userResponse == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new  ResponseEntity<>(userResponse, HttpStatus.OK);
    }

    @GetMapping("/getFacultyById/{facultyId}")
    public ResponseEntity<FacultyResponse> getFacultyById(@PathVariable String facultyId) {
        FacultyResponse facultyResponse = adminService.getFacultyById(facultyId);
        if (facultyResponse == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new  ResponseEntity<>(facultyResponse, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable String id) {
        boolean res = adminService.deleteUserById(id);
        if (res) {
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }


}
