package com.campusarena.eventhub.user.service;

import com.campusarena.eventhub.club.model.Club;
import com.campusarena.eventhub.club.repository.ClubRepository;
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
import com.campusarena.eventhub.registration.model.RegistrationForm;
import com.campusarena.eventhub.registration.model.RegistrationResponse;
import com.campusarena.eventhub.registration.repository.RegistrationFormRepository;
import com.campusarena.eventhub.registration.repository.RegistrationResponseRepository;
import com.campusarena.eventhub.user.dto.CollectiveActivityDTO;
import com.campusarena.eventhub.user.dto.UserActivityDTO;
import com.campusarena.eventhub.user.model.User;
import com.campusarena.eventhub.user.repository.UserRepository;
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
    private final RegistrationResponseRepository registrationResponseRepository;
    private final RegistrationFormRepository registrationFormRepository;
    private final UserRepository userRepository;
    private final ClubRepository clubRepository;

    public CollectiveActivityDTO getCollectiveActivity(com.campusarena.eventhub.user.model.Course course, String session, String section) {
        List<User> users;
        if (section == null || section.isEmpty()) {
            users = userRepository.findByCourseAndSession(course, session);
        } else {
            users = userRepository.findByCourseAndSessionAndSection(course, session, section);
        }

        List<CollectiveActivityDTO.UserWithActivityDTO> userActivities = users.stream()
                .map(user -> {
                    // Hide password for security
                    user.setPassword(null);
                    return new CollectiveActivityDTO.UserWithActivityDTO(user, getUserActivity(user.getId()));
                })
                .collect(Collectors.toList());

        return new CollectiveActivityDTO(userActivities);
    }

    public UserActivityDTO getUserActivity(String userId) {
        // Fetch all clubs for mapping
        Map<String, String> clubNameMap = clubRepository.findAll().stream()
                .collect(Collectors.toMap(Club::getId, Club::getName));

        // ─── MCQ Activities ───────────────────────────────────────────────
        List<EventRegistration> registrations = registrationRepository.findByUserId(userId);
        Map<String, EventRegistration> registrationByEvent = registrations.stream()
                .collect(Collectors.toMap(EventRegistration::getEventId, r -> r, (a, b) -> a));

        // Map eventId -> submission (if exists)
        List<McqSubmission> submissions = mcqSubmissionRepository.findByUserId(userId);
        Map<String, McqSubmission> submissionByEvent = submissions.stream()
                .collect(Collectors.toMap(McqSubmission::getEventId, s -> s, (a, b) -> a));

        // Get all unique event IDs from both registrations and submissions
        Set<String> allEventIds = new HashSet<>();
        allEventIds.addAll(registrationByEvent.keySet());
        allEventIds.addAll(submissionByEvent.keySet());

        // Map eventId -> event
        Map<String, Event> eventsById = eventRepository.findAllById(allEventIds).stream()
                .collect(Collectors.toMap(Event::getId, e -> e));

        // Calculate rank for each submission
        List<UserActivityDTO.McqActivityDTO> mcqActivities = allEventIds.stream()
                .map(eventId -> {
                    Event event = eventsById.get(eventId);
                    EventRegistration reg = registrationByEvent.get(eventId);
                    McqSubmission sub = submissionByEvent.get(eventId);

                    String status = sub != null ? sub.getStatus() : (reg != null ? "REGISTERED" : "PARTICIPATED");
                    Double score = sub != null ? sub.getTotalScore() : null;
                    Integer rank = sub != null ? calculateMcqRank(eventId, userId) : null;
                    String submittedAt = sub != null && sub.getSubmittedAt() != null
                            ? sub.getSubmittedAt().toString() : "";
                    String registeredAt = reg != null && reg.getRegisteredAt() != null
                            ? reg.getRegisteredAt().toString() : "";
                    
                    String clubName = (event != null && event.getClubId() != null) ? clubNameMap.getOrDefault(event.getClubId(), "General") : "General";

                    return new UserActivityDTO.McqActivityDTO(
                            eventId,
                            event != null ? event.getTitle() : "Unknown Event",
                            registeredAt,
                            submittedAt,
                            status,
                            score,
                            event != null ? event.getTotalMarks() : null,
                            rank,
                            clubName
                    );
                })
                .sorted((a, b) -> {
                    String timeA = !a.getSubmittedAt().isEmpty() ? a.getSubmittedAt() : a.getRegisteredAt();
                    String timeB = !b.getSubmittedAt().isEmpty() ? b.getSubmittedAt() : b.getRegisteredAt();
                    return timeB.compareTo(timeA);
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

                    // Group by problemId to handle multiple submissions correctly
                    Map<String, Submission> bestSubByProblem = subs.stream()
                            .collect(Collectors.toMap(
                                    Submission::getProblemId,
                                    s -> s,
                                    (s1, s2) -> (s1.getScore() != null ? s1.getScore() : 0) >= (s2.getScore() != null ? s2.getScore() : 0) ? s1 : s2
                            ));

                    long solved = bestSubByProblem.values().stream()
                            .filter(s -> "ACCEPTED".equals(s.getVerdict()))
                            .count();
                    int totalScore = bestSubByProblem.values().stream()
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
                    
                    String clubName = (contest != null && contest.getClubId() != null) ? clubNameMap.getOrDefault(contest.getClubId(), "General") : "General";

                    return new UserActivityDTO.ContestActivityDTO(
                            contestId,
                            contest != null ? contest.getTitle() : "Unknown Contest",
                            (int) solved,
                            totalProblems,
                            totalScore,
                            lastTime,
                            null,
                            clubName
                    );
                })
                .collect(Collectors.toList());

        // ─── Registration Activities ───────────────────────────────────
        List<RegistrationResponse> formResponses = registrationResponseRepository.findByUserId(userId);
        
        // Map formId -> form
        Set<String> formIds = formResponses.stream()
                .map(RegistrationResponse::getFormId).collect(Collectors.toSet());
        Map<String, RegistrationForm> formsById = registrationFormRepository.findAllById(formIds).stream()
                .collect(Collectors.toMap(RegistrationForm::getId, f -> f));

        List<UserActivityDTO.RegistrationActivityDTO> registrationActivities = formResponses.stream()
                .map(response -> {
                    RegistrationForm form = formsById.get(response.getFormId());
                    // Skip coding contests and quizzes as they are handled in their own sections if needed,
                    // but usually, MCQ events have registrationForms too.
                    // The user said "except coding contest and quiz event, for all other event for which i create registration form"
                    // So we should filter them out here if they are linked to an event/contest.
                    if (form != null && (form.getEventId() != null || form.getContestId() != null)) {
                        return null; 
                    }
                    
                    String clubName = (form != null && form.getClubId() != null) ? clubNameMap.getOrDefault(form.getClubId(), "General") : "General";

                    return new UserActivityDTO.RegistrationActivityDTO(
                            response.getFormId(),
                            form != null ? form.getTitle() : "Unknown Event",
                            response.getSubmittedAt() != null ? response.getSubmittedAt().toString() : "",
                            response.getStatus(),
                            response.getEvaluationStatus() != null ? response.getEvaluationStatus() : "PENDING",
                            response.getTotalEvaluationMarks(),
                            response.getMaxPossibleMarks(),
                            clubName
                    );
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return new UserActivityDTO(mcqActivities, contestActivities, registrationActivities);
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
