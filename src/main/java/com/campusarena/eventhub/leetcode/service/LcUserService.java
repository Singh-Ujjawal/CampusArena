package com.campusarena.eventhub.leetcode.service;

import com.campusarena.eventhub.leetcode.dto.LcUserProfileResponse;
import com.campusarena.eventhub.leetcode.model.LcQuestion;
import com.campusarena.eventhub.leetcode.model.LcUserQuestion;
import com.campusarena.eventhub.leetcode.repository.LcQuestionRepository;
import com.campusarena.eventhub.leetcode.repository.LcUserQuestionRepository;
import com.campusarena.eventhub.user.model.User;
import com.campusarena.eventhub.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LcUserService {
    private final UserRepository userRepository;
    private final LcQuestionRepository lcQuestionRepository;
    private final LcUserQuestionRepository lcUserQuestionRepository;
    private final LeetCodeService leetCodeService;
    private final ObjectMapper objectMapper;

    private static final long COOLDOWN_MILLIS = 2 * 60 * 1000L; // 2 minutes

    public String syncUser(String userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String leetCodeUsername = user.getLeetCodeUsername();
        if (leetCodeUsername == null || leetCodeUsername.isBlank()) {
            throw new RuntimeException("LeetCode username not set for this user");
        }

        // ── Sync cooldown check (matches lctesting behaviour) ──────────────
        long currentTime = System.currentTimeMillis();
        Long lastSyncedTimestamp = user.getLastSyncedTimestamp();
        if (lastSyncedTimestamp != null && lastSyncedTimestamp != 0L
                && (currentTime - lastSyncedTimestamp) < COOLDOWN_MILLIS) {
            long remainingMillis = COOLDOWN_MILLIS - (currentTime - lastSyncedTimestamp);
            long remainingSeconds = remainingMillis / 1000;
            throw new RuntimeException(
                    "Please wait " + remainingSeconds + " seconds before syncing again.");
        }

        String response = leetCodeService.fetchRecentSubmissions(leetCodeUsername);
        if (response == null || response.isBlank()) {
            throw new RuntimeException("Could not fetch data from LeetCode. Please try again later.");
        }

        JsonNode submissions = objectMapper.readTree(response)
                .path("data")
                .path("recentSubmissionList");

        if (submissions.isMissingNode() || !submissions.isArray()) {
            // Still update the sync time even when there's nothing new
            user.setLastSyncedTimestamp(System.currentTimeMillis());
            user.setLastSyncTime(LocalDateTime.now());
            userRepository.save(user);
            return "Sync completed. No recent submissions found on LeetCode.";
        }

        int newSolvedCount = 0;
        for (JsonNode sub : submissions) {
            // LeetCode returns "Accepted" as text; numeric 10 is a fallback
            String status = sub.path("status").asText();
            if (!status.equals("Accepted") && sub.path("status").asInt() != 10) {
                continue;
            }

            String slug = sub.path("titleSlug").asText();
            Optional<LcQuestion> questionOpt = lcQuestionRepository.findBySlug(slug);

            if (questionOpt.isPresent()) {
                LcQuestion question = questionOpt.get();
                boolean alreadyExists = lcUserQuestionRepository
                        .existsByCampusUserIdAndQuestionId(user.getId(), question.getId());
                if (!alreadyExists) {
                    LcUserQuestion uq = new LcUserQuestion();
                    uq.setCampusUserId(user.getId());
                    uq.setQuestionId(question.getId());
                    uq.setSolvedAt(sub.path("timestamp").asLong());
                    lcUserQuestionRepository.save(uq);
                    newSolvedCount++;
                }
            }
        }

        // ── Persist sync time so cooldown works on next request ────────────
        user.setLastSyncedTimestamp(System.currentTimeMillis());
        user.setLastSyncTime(LocalDateTime.now());
        userRepository.save(user);

        return "Sync completed. New questions added: " + newSolvedCount;
    }

    public LcUserProfileResponse getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<LcUserQuestion> solvedList = lcUserQuestionRepository.findByCampusUserId(user.getId());
        long totalSolved = solvedList.size();
        Map<String, Long> difficultyStats = new HashMap<>();
        Map<String, Long> topicStats = new HashMap<>();

        for (LcUserQuestion uq : solvedList) {
            lcQuestionRepository.findById(uq.getQuestionId()).ifPresent(question -> {
                difficultyStats.put(
                        question.getDifficulty(),
                        difficultyStats.getOrDefault(question.getDifficulty(), 0L) + 1);
                topicStats.put(
                        question.getTopic(),
                        topicStats.getOrDefault(question.getTopic(), 0L) + 1);
            });
        }

        return LcUserProfileResponse.builder()
                .name(user.getFirstName() + " " + user.getLastName())
                .leetCodeUsername(user.getLeetCodeUsername())
                .totalSolved(totalSolved)
                .difficultyStats(difficultyStats)
                .topicStats(topicStats)
                .lastSyncTime(user.getLastSyncTime())
                .lastSyncedTimestamp(user.getLastSyncedTimestamp())
                .build();
    }

    public List<Map<String, Object>> getLeaderboard() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> leaderboard = new ArrayList<>();
        for (User user : users) {
            if (user.getLeetCodeUsername() != null && !user.getLeetCodeUsername().isBlank()) {
                long solvedCount = lcUserQuestionRepository.countByCampusUserId(user.getId());
                Map<String, Object> entry = new HashMap<>();
                entry.put("name", user.getFirstName() + " " + user.getLastName());
                entry.put("leetCodeUsername", user.getLeetCodeUsername());
                entry.put("totalSolved", solvedCount);
                entry.put("userId", user.getId());
                leaderboard.add(entry);
            }
        }
        leaderboard.sort((a, b) -> Long.compare((Long) b.get("totalSolved"), (Long) a.get("totalSolved")));
        return leaderboard;
    }
}
