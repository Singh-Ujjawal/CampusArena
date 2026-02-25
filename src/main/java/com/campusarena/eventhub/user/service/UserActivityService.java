package com.campusarena.eventhub.user.service;

import com.campusarena.eventhub.contest.model.Contest;
import com.campusarena.eventhub.contest.model.Submission;
import com.campusarena.eventhub.contest.repository.ContestRepository;
import com.campusarena.eventhub.contest.repository.SubmissionRepository;
import com.campusarena.eventhub.event.model.Event;
import com.campusarena.eventhub.event.model.EventRegistration;
import com.campusarena.eventhub.event.model.McqSubmission;
import com.campusarena.eventhub.event.repository.EventRegistrationRepository;
import com.campusarena.eventhub.event.repository.EventRepository;
import com.campusarena.eventhub.event.repository.McqSubmissionRepository;
import com.campusarena.eventhub.user.dto.UserActivityDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserActivityService {

    private final EventRegistrationRepository registrationRepository;
    private final McqSubmissionRepository mcqSubmissionRepository;
    private final EventRepository eventRepository;
    private final SubmissionRepository submissionRepository;
    private final ContestRepository contestRepository;

    public UserActivityDTO getUserActivity(String userId) {
        // ─── MCQ Activities ───────────────────────────────────────────────
        List<EventRegistration> registrations = registrationRepository.findByUserId(userId);

        // Map eventId -> submission (if exists)
        List<McqSubmission> submissions = mcqSubmissionRepository.findByUserId(userId);
        Map<String, McqSubmission> submissionByEvent = submissions.stream()
                .collect(Collectors.toMap(McqSubmission::getEventId, s -> s, (a, b) -> a));

        // Map eventId -> event
        Set<String> eventIds = registrations.stream()
                .map(EventRegistration::getEventId).collect(Collectors.toSet());
        Map<String, Event> eventsById = eventRepository.findAllById(eventIds).stream()
                .collect(Collectors.toMap(Event::getId, e -> e));

        // Calculate rank for each submission
        List<UserActivityDTO.McqActivityDTO> mcqActivities = registrations.stream()
                .map(reg -> {
                    Event event = eventsById.get(reg.getEventId());
                    McqSubmission sub = submissionByEvent.get(reg.getEventId());
                    String status = sub != null ? sub.getStatus() : "REGISTERED";
                    Double score = sub != null ? sub.getTotalScore() : null;
                    Integer rank = sub != null ? calculateMcqRank(reg.getEventId(), userId) : null;
                    String submittedAt = sub != null && sub.getSubmittedAt() != null
                            ? sub.getSubmittedAt().toString() : null;

                    return new UserActivityDTO.McqActivityDTO(
                            reg.getEventId(),
                            event != null ? event.getTitle() : "Unknown Event",
                            reg.getRegisteredAt() != null ? reg.getRegisteredAt().toString() : "",
                            submittedAt,
                            status,
                            score,
                            event != null ? event.getTotalMarks() : null,
                            rank
                    );
                })
                .collect(Collectors.toList());

        // ─── Contest Activities ───────────────────────────────────────────
        List<Submission> contestSubmissions = submissionRepository.findByUserId(userId);

        // Group by contestId
        Map<String, List<Submission>> byContest = contestSubmissions.stream()
                .collect(Collectors.groupingBy(Submission::getContestId));

        // Map contestId -> contest
        Map<String, Contest> contestsById = contestRepository.findAllById(byContest.keySet()).stream()
                .collect(Collectors.toMap(Contest::getId, c -> c));

        List<UserActivityDTO.ContestActivityDTO> contestActivities = byContest.entrySet().stream()
                .map(entry -> {
                    String contestId = entry.getKey();
                    List<Submission> subs = entry.getValue();
                    Contest contest = contestsById.get(contestId);

                    long solved = subs.stream().filter(s -> "ACCEPTED".equals(s.getVerdict())).count();
                    int totalScore = subs.stream()
                            .filter(s -> "ACCEPTED".equals(s.getVerdict()))
                            .mapToInt(s -> s.getScore() != null ? s.getScore() : 0)
                            .sum();
                    String lastTime = subs.stream()
                            .filter(s -> s.getSubmittedAt() != null)
                            .max(Comparator.comparing(Submission::getSubmittedAt))
                            .map(s -> s.getSubmittedAt().toString())
                            .orElse(null);
                    int totalProblems = contest != null && contest.getProblemIds() != null
                            ? contest.getProblemIds().size() : 0;

                    return new UserActivityDTO.ContestActivityDTO(
                            contestId,
                            contest != null ? contest.getTitle() : "Unknown Contest",
                            (int) solved,
                            totalProblems,
                            totalScore,
                            lastTime,
                            null
                    );
                })
                .collect(Collectors.toList());

        return new UserActivityDTO(mcqActivities, contestActivities);
    }

    private int calculateMcqRank(String eventId, String userId) {
        List<McqSubmission> ranked = mcqSubmissionRepository
                .findByEventIdOrderByTotalScoreDescSubmittedAtAsc(eventId);
        for (int i = 0; i < ranked.size(); i++) {
            if (userId.equals(ranked.get(i).getUserId())) return i + 1;
        }
        return ranked.size() + 1;
    }
}
