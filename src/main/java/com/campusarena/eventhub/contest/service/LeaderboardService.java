package com.campusarena.eventhub.contest.service;

import com.campusarena.eventhub.contest.dto.LeaderboardEntry;
import com.campusarena.eventhub.contest.model.Contest;
import com.campusarena.eventhub.contest.model.Submission;
import com.campusarena.eventhub.contest.repository.ContestRepository;
import com.campusarena.eventhub.contest.repository.SubmissionRepository;
import com.campusarena.eventhub.exception.ResourceNotFoundException;
import com.campusarena.eventhub.user.model.User;
import com.campusarena.eventhub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final SubmissionRepository submissionRepository;
    private final ContestRepository contestRepository;
    private final UserRepository userRepository;

    public List<LeaderboardEntry> getLeaderboard(String contestId) {
        if (!contestRepository.existsById(contestId)) {
            throw new ResourceNotFoundException("Contest not found");
        }

        List<Submission> submissions = submissionRepository.findByContestId(contestId);
        Map<String, Map<String, Submission>> bestSubmissions = new HashMap<>();

        for (Submission sub : submissions) {
            // Skip submissions with missing keys to avoid NPE
            if (sub.getUserId() == null || sub.getProblemId() == null) continue;
            bestSubmissions.computeIfAbsent(sub.getUserId(), k -> new HashMap<>());
            Map<String, Submission> userProblems = bestSubmissions.get(sub.getUserId());
            Submission existing = userProblems.get(sub.getProblemId());

            if (existing == null || Optional.ofNullable(sub.getScore()).orElse(0) > Optional.ofNullable(existing.getScore()).orElse(0)) {
                userProblems.put(sub.getProblemId(), sub);
            }
        }

        List<LeaderboardEntry> leaderboard = new ArrayList<>();
        for (String userId : bestSubmissions.keySet()) {
            Map<String, Submission> userProblems = bestSubmissions.get(userId);
            int totalScore = 0;
            int solved = 0;
            Instant lastTime = null;

            for (Submission sub : userProblems.values()) {
                totalScore += Optional.ofNullable(sub.getScore()).orElse(0);
                if (Optional.ofNullable(sub.getScore()).orElse(0) > 0) solved++;
                Instant submittedAt = sub.getSubmittedAt();
                if (submittedAt != null && (lastTime == null || submittedAt.isAfter(lastTime))) {
                    lastTime = submittedAt;
                }
            }

            User user = userRepository.findById(userId).orElse(null);
            leaderboard.add(LeaderboardEntry.builder()
                    .userId(userId)
                    .username(user != null ? user.getUsername() : "Unknown")
                    .rollNumber(user != null ? user.getRollNumber() : "N/A")
                    .totalScore(totalScore)
                    .problemsSolved(solved)
                    .lastSubmissionTime(lastTime)
                    .build());
        }

        leaderboard.sort((a, b) -> {
            if (b.getTotalScore() != a.getTotalScore()) return Integer.compare(b.getTotalScore(), a.getTotalScore());
            if (a.getLastSubmissionTime() == null && b.getLastSubmissionTime() == null) return 0;
            if (a.getLastSubmissionTime() == null) return 1;
            if (b.getLastSubmissionTime() == null) return -1;
            return a.getLastSubmissionTime().compareTo(b.getLastSubmissionTime());
        });

        return leaderboard;
    }
}
