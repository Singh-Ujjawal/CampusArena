package com.campusarena.eventhub.user;

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
    public ResponseEntity<FacultyResponse> updateFaculty(@PathVariable String facultyId, @RequestBody FacultyRequest facultyRequest) {
        FacultyResponse facultyResponse = facultyService.updateFaculty(facultyRequest, facultyId);
        if (facultyResponse == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(facultyResponse, HttpStatus.OK);
    }

    @GetMapping("/{facultyId}")
    public ResponseEntity<FacultyResponse> getFaculty(@PathVariable String facultyId) {
        FacultyResponse facultyResponse = facultyService.getUserById(facultyId);
        if (facultyResponse == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(facultyResponse, HttpStatus.OK);
    }
}
