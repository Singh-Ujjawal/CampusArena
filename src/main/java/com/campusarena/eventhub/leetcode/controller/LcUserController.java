package com.campusarena.eventhub.leetcode.controller;

import com.campusarena.eventhub.leetcode.dto.LcUserProfileResponse;
import com.campusarena.eventhub.leetcode.model.LcQuestion;
import com.campusarena.eventhub.leetcode.service.LcQuestionService;
import com.campusarena.eventhub.leetcode.service.LcUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/leetcode")
@RequiredArgsConstructor
public class LcUserController {

    private final LcUserService lcUserService;
    private final LcQuestionService lcQuestionService;

    @GetMapping("/questions")
    public List<LcQuestion> getAllQuestions() {
        return lcQuestionService.getAllQuestions();
    }

    @PostMapping("/sync/{userId}")
    public ResponseEntity<Map<String, String>> syncUser(@PathVariable String userId) throws Exception {
        String msg = lcUserService.syncUser(userId);
        return ResponseEntity.ok(Map.of("message", msg));
    }

    @GetMapping("/profile/{userId}")
    public LcUserProfileResponse getProfile(@PathVariable String userId) {
        return lcUserService.getUserProfile(userId);
    }

    @GetMapping("/leaderboard")
    public List<Map<String, Object>> leaderboard() {
        return lcUserService.getLeaderboard();
    }
}
