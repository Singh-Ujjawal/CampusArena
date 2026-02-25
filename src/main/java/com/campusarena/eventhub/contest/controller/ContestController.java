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

    @PostMapping
    public ResponseEntity<ContestResponse> createContest(@Valid @RequestBody ContestRequest request) {
        return ResponseEntity.ok(contestService.createContest(request));
    }

    @GetMapping
    public ResponseEntity<List<ContestResponse>> getAllContests() {
        return ResponseEntity.ok(contestService.getAllContests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContestResponse> getContestById(@PathVariable String id) {
        return ResponseEntity.ok(contestService.getContestById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContestResponse> updateContest(@PathVariable String id, @Valid @RequestBody ContestRequest request) {
        return ResponseEntity.ok(contestService.updateContest(request, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContest(@PathVariable String id) {
        contestService.deleteContest(id);
        return ResponseEntity.noContent().build();
    }
}
