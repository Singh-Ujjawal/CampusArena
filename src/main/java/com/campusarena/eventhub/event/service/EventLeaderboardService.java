package com.campusarena.eventhub.event.service;

import com.campusarena.eventhub.event.dto.EventLeaderboardEntry;
import com.campusarena.eventhub.event.model.McqSubmission;
import com.campusarena.eventhub.event.repository.McqSubmissionRepository;
import com.campusarena.eventhub.user.model.User;
import com.campusarena.eventhub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventLeaderboardService {

    private final McqSubmissionRepository mcqSubmissionRepository;
    private final UserRepository userRepository;

    public List<EventLeaderboardEntry> getLeaderboard(String eventId) {
        List<McqSubmission> submissions = mcqSubmissionRepository.findByEventIdOrderByTotalScoreDescSubmittedAtAsc(eventId);
        
        return submissions.stream()
                .map(sub -> {
                    User user = userRepository.findById(sub.getUserId()).orElse(null);
                    return EventLeaderboardEntry.builder()
                            .userId(sub.getUserId())
                            .username(user != null ? user.getUsername() : "Unknown")
                            .rollNumber(user != null ? user.getRollNumber() : "N/A")
                            .score(sub.getTotalScore() != null ? sub.getTotalScore() : 0.0)
                            .correctAnswers(sub.getCorrectCount() != null ? sub.getCorrectCount() : 0)
                            .attempted(sub.getAttemptedCount() != null ? sub.getAttemptedCount() : 0)
                            .submittedAt(sub.getSubmittedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
