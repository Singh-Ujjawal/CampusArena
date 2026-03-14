package com.campusarena.eventhub.event.controller;

import com.campusarena.eventhub.event.dto.EventLeaderboardEntry;
import com.campusarena.eventhub.event.service.EventLeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events/leaderboard")
@RequiredArgsConstructor
public class EventLeaderboardController {

    private final EventLeaderboardService eventLeaderboardService;

    @GetMapping("/{eventId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<List<EventLeaderboardEntry>> getLeaderboard(@PathVariable String eventId) {
        return ResponseEntity.ok(eventLeaderboardService.getLeaderboard(eventId));
    }
}
