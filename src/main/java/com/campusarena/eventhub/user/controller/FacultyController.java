package com.campusarena.eventhub.user.controller;

import com.campusarena.eventhub.user.dto.FacultyRequest;
import com.campusarena.eventhub.user.dto.FacultyResponse;
import com.campusarena.eventhub.user.service.FacultyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/faculty")
@RestController
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyService facultyService;

    @PutMapping("/{facultyId}")
    public ResponseEntity<FacultyResponse> updateFaculty(@PathVariable String facultyId, @Valid @RequestBody FacultyRequest facultyRequest) {
        FacultyResponse facultyResponse = facultyService.updateFaculty(facultyRequest, facultyId);
        return new ResponseEntity<>(facultyResponse, HttpStatus.OK);
    }

    @GetMapping("/{facultyId}")
    public ResponseEntity<FacultyResponse> getFaculty(@PathVariable String facultyId) {
        FacultyResponse facultyResponse = facultyService.getUserById(facultyId);
        return new ResponseEntity<>(facultyResponse, HttpStatus.OK);
    }
}
