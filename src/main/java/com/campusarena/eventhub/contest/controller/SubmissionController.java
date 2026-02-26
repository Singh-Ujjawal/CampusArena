package com.campusarena.eventhub.contest.controller;

import com.campusarena.eventhub.contest.dto.RunRequest;
import com.campusarena.eventhub.contest.dto.RunResponse;
import com.campusarena.eventhub.contest.dto.SubmissionRequest;
import com.campusarena.eventhub.contest.dto.SubmissionResponse;
import com.campusarena.eventhub.contest.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;
    
    @GetMapping
    public ResponseEntity<List<SubmissionResponse>> getAllSubmissions() {
        return ResponseEntity.ok(submissionService.getAllSubmissions());
    }

    @PostMapping
    public ResponseEntity<SubmissionResponse> submitCode(@Valid @RequestBody SubmissionRequest request) {
        return ResponseEntity.ok(submissionService.submitCode(request));
    }

    @PostMapping("/run")
    public ResponseEntity<RunResponse> runSampleTests(@Valid @RequestBody RunRequest request) {
        return ResponseEntity.ok(submissionService.runSampleTests(request));
    }

    @GetMapping("/contest/{contestId}")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsByContest(@PathVariable String contestId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByContest(contestId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByUser(userId));
    }

    @GetMapping("/contest/{contestId}/user/{userId}")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsByContestAndUser(
            @PathVariable String contestId, 
            @PathVariable String userId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByContestAndUser(contestId, userId));
    }
}
