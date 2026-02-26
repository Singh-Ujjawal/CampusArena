package com.campusarena.eventhub.contest.controller;

import com.campusarena.eventhub.contest.dto.ContestRequest;
import com.campusarena.eventhub.contest.dto.ContestResponse;
import com.campusarena.eventhub.contest.service.ContestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contests")
@RequiredArgsConstructor
public class ContestController {

    private final ContestService contestService;
    private final com.campusarena.eventhub.user.service.SecurityService securityService;

    @PostMapping
    public ResponseEntity<ContestResponse> createContest(@Valid @RequestBody ContestRequest request, @RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(contestService.createContest(request, securityService.getCurrentUser(auth)));
    }

    @GetMapping
    public ResponseEntity<List<ContestResponse>> getAllContests(@RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(contestService.getAllContests(securityService.getCurrentUser(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContestResponse> getContestById(@PathVariable String id) {
        return ResponseEntity.ok(contestService.getContestById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContestResponse> updateContest(@PathVariable String id, @Valid @RequestBody ContestRequest request, @RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(contestService.updateContest(request, id, securityService.getCurrentUser(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContest(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String auth) {
        contestService.deleteContest(id, securityService.getCurrentUser(auth));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/validate-password")
    public ResponseEntity<Boolean> validatePassword(@PathVariable String id, @RequestParam String password, @RequestParam String userId) {
        return ResponseEntity.ok(contestService.validatePassword(id, password, userId));
    }
}
