package com.campusarena.eventhub.contest.controller;

import com.campusarena.eventhub.contest.dto.ProblemRequest;
import com.campusarena.eventhub.contest.dto.ProblemResponse;
import com.campusarena.eventhub.contest.service.ProblemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;
    private final com.campusarena.eventhub.user.service.SecurityService securityService;

    @PostMapping
    public ResponseEntity<ProblemResponse> createProblem(@Valid @RequestBody ProblemRequest request, @RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(problemService.insertProblem(request, securityService.getCurrentUser(auth)));
    }

    @GetMapping
    public ResponseEntity<List<ProblemResponse>> getAllProblems(@RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(problemService.getAllProblems(securityService.getCurrentUser(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProblemResponse> getProblemById(@PathVariable String id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProblemResponse> updateProblem(@PathVariable String id, @Valid @RequestBody ProblemRequest request, @RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(problemService.updateProblem(request, id, securityService.getCurrentUser(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProblem(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String auth) {
        problemService.deleteProblemById(id, securityService.getCurrentUser(auth));
        return ResponseEntity.noContent().build();
    }
}
