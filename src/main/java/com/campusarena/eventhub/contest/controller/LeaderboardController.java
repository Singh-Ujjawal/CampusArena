package com.campusarena.eventhub.contest.controller;

import com.campusarena.eventhub.contest.dto.LeaderboardEntry;
import com.campusarena.eventhub.contest.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping("/{contestId}")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard(@PathVariable String contestId) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard(contestId));
    }
}
