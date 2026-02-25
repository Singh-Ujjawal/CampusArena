package com.campusarena.eventhub.event.service;

import com.campusarena.eventhub.event.dto.*;
import com.campusarena.eventhub.event.model.*;
import com.campusarena.eventhub.event.repository.*;
import com.campusarena.eventhub.exception.ApiException;
import com.campusarena.eventhub.exception.ResourceNotFoundException;
import com.campusarena.eventhub.user.model.User;
import com.campusarena.eventhub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final EventRepository eventRepository;
    private final McqQuestionRepository questionRepository;
    private final McqSubmissionRepository submissionRepository;
    private final EventRegistrationRepository registrationRepository;
    private final UserRepository userRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAll().stream()
                .peek(this::updateStatus)
                .collect(Collectors.toList());
    }

    public Event getEventById(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        updateStatus(event);
        return event;
    }

    private void updateStatus(Event event) {
        if (event.getStartTime() == null || event.getEndTime() == null) {
            return;
        }
        Instant now = Instant.now();
        if (now.isBefore(event.getStartTime())) {
            event.setStatus("UPCOMING");
        } else if (now.isAfter(event.getEndTime())) {
            event.setStatus("COMPLETED");
        } else {
            event.setStatus("LIVE");
        }
    }

    public List<QuestionResponseDTO> startTest(String userId, String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (event.getStartTime() == null || event.getEndTime() == null) {
            throw new ApiException("Event timing not configured properly");
        }

        Instant now = Instant.now();
        if (now.isBefore(event.getStartTime())) {
            throw new ApiException("Event has not started yet");
        }
        if (now.isAfter(event.getEndTime())) {
            throw new ApiException("Event has ended");
        }

        // Auto-register if not registered (allows joining during live window)
        if (!registrationRepository.existsByEventIdAndUserId(eventId, userId)) {
            EventRegistration reg = new EventRegistration();
            reg.setEventId(eventId);
            reg.setUserId(userId);
            reg.setRegisteredAt(now);
            reg.setStatus("REGISTERED");
            registrationRepository.save(reg);
        }

        Optional<McqSubmission> existingSubmission =
                submissionRepository.findTopByUserIdAndEventIdOrderByStartTimeDesc(userId, eventId);

        if (existingSubmission.isPresent()) {
            McqSubmission submission = existingSubmission.get();
            if ("COMPLETED".equals(submission.getStatus()) || "AUTO_SUBMITTED".equals(submission.getStatus())) {
                throw new ApiException("Test already submitted");
            }
            return getQuestions(eventId);
        }

        McqSubmission submission = new McqSubmission();
        submission.setUserId(userId);
        submission.setEventId(eventId);
        submission.setStartTime(now);
        submission.setStatus("IN_PROGRESS");
        submissionRepository.save(submission);

        return getQuestions(eventId);
    }

    private List<QuestionResponseDTO> getQuestions(String eventId) {
        return questionRepository.findByEventId(eventId)
                .stream()
                .map(q -> new QuestionResponseDTO(
                        q.getId(),
                        q.getQuestionText(),
                        q.getOptions(),
                        q.getMarks(),
                        q.getNegativeMarks()
                ))
                .collect(Collectors.toList());
    }

    public McqResultDTO submitTest(String userId, String eventId, SubmitMcqRequestDTO request) {
        McqSubmission submission = submissionRepository
                .findTopByUserIdAndEventIdOrderByStartTimeDesc(userId, eventId)
                .orElseThrow(() -> new ApiException("Test not started"));

        if ("COMPLETED".equals(submission.getStatus())) {
            throw new ApiException("Test already submitted");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        Instant now = Instant.now();
        long minutesElapsed = Duration.between(submission.getStartTime(), now).toMinutes();

        if (event.getDurationInMinutes() != null && minutesElapsed > event.getDurationInMinutes()) {
            submission.setStatus("AUTO_SUBMITTED");
        }

        List<McqQuestion> questions = questionRepository.findByEventId(eventId);
        Map<String, McqQuestion> questionMap = questions.stream()
                .collect(Collectors.toMap(McqQuestion::getId, q -> q));

        double totalScore = 0.0;
        int correct = 0;
        int wrong = 0;
        int attempted = 0;

        if (request != null && request.getAnswers() != null) {
            for (Answer ans : request.getAnswers()) {
                if (ans == null || ans.getQuestionId() == null) continue;
                attempted++;
                McqQuestion question = questionMap.get(ans.getQuestionId());
                if (question == null) continue;

                if (Objects.equals(ans.getSelectedOption(), question.getCorrectOption())) {
                    totalScore += Optional.ofNullable(question.getMarks()).orElse(0.0);
                    correct++;
                } else if (ans.getSelectedOption() != null) {
                    wrong++;
                    totalScore -= Optional.ofNullable(question.getNegativeMarks()).orElse(0.0);
                }
            }
        }

        submission.setSubmittedAt(now);
        submission.setAnswers(request != null ? request.getAnswers() : new ArrayList<>());
        submission.setTotalScore(Math.max(0.0, totalScore));
        submission.setCorrectCount(correct);
        submission.setWrongCount(wrong);
        submission.setAttemptedCount(attempted);
        submission.setStatus("COMPLETED");
        submissionRepository.save(submission);

        return new McqResultDTO(Math.max(0.0, totalScore), correct, wrong, calculateRank(eventId, userId));
    }

    private int calculateRank(String eventId, String userId) {
        List<McqSubmission> submissions = submissionRepository.findByEventIdOrderByTotalScoreDescSubmittedAtAsc(eventId);
        for (int i = 0; i < submissions.size(); i++) {
            if (userId.equals(submissions.get(i).getUserId())) {
                return i + 1;
            }
        }
        return submissions.size();
    }

    public McqResultDTO getTestResult(String userId, String eventId) {
        McqSubmission submission = submissionRepository
                .findTopByUserIdAndEventIdOrderByStartTimeDesc(userId, eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        return new McqResultDTO(
                submission.getTotalScore(),
                submission.getCorrectCount(),
                submission.getWrongCount(),
                calculateRank(eventId, userId)
        );
    }

    public RemainingTimeResponseDTO getRemainingTime(String userId, String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        Instant now = Instant.now();

        Optional<McqSubmission> submissionOpt = submissionRepository
                .findTopByUserIdAndEventIdOrderByStartTimeDesc(userId, eventId);

        // If no submission yet, compute remaining time from event window
        if (submissionOpt.isEmpty()) {
            if (event.getEndTime() == null) {
                return new RemainingTimeResponseDTO(0, "NOT_STARTED", now, now);
            }
            long remainingFromEvent = Math.max(0, Duration.between(now, event.getEndTime()).getSeconds());
            // Also cap by durationInMinutes if set
            if (event.getDurationInMinutes() != null) {
                long durationSeconds = (long) event.getDurationInMinutes() * 60;
                remainingFromEvent = Math.min(remainingFromEvent, durationSeconds);
            }
            return new RemainingTimeResponseDTO(remainingFromEvent, "NOT_STARTED", now, event.getEndTime());
        }

        McqSubmission submission = submissionOpt.get();

        if ("COMPLETED".equals(submission.getStatus()) || "AUTO_SUBMITTED".equals(submission.getStatus())) {
            return new RemainingTimeResponseDTO(0, submission.getStatus(), submission.getStartTime(), event.getEndTime());
        }

        long totalAllowedSeconds = (long) Optional.ofNullable(event.getDurationInMinutes()).orElse(0) * 60;
        long elapsedSeconds = Duration.between(submission.getStartTime(), now).getSeconds();
        long remaining = Math.max(0, totalAllowedSeconds - elapsedSeconds);

        if (remaining == 0) {
            submission.setStatus("AUTO_SUBMITTED");
            submission.setSubmittedAt(now);
            submissionRepository.save(submission);
        }

        return new RemainingTimeResponseDTO(remaining, submission.getStatus(), submission.getStartTime(), event.getEndTime());
    }

    public AdminEventAnalyticsDTO getEventAnalytics(String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        long totalRegistrations = registrationRepository.countByEventId(eventId);
        List<McqSubmission> submissions = submissionRepository.findByEventIdOrderByTotalScoreDescSubmittedAtAsc(eventId);
        long totalAttempts = submissions.size();
        long totalAbsent = Math.max(0, totalRegistrations - totalAttempts);

        if (submissions.isEmpty()) {
            return new AdminEventAnalyticsDTO(totalRegistrations, 0, totalRegistrations, 0, 0, 0, 0, List.of());
        }

        List<Double> scores = submissions.stream().map(McqSubmission::getTotalScore).toList();
        double highest = scores.stream().max(Double::compare).orElse(0.0);
        double lowest = scores.stream().min(Double::compare).orElse(0.0);
        double average = scores.stream().mapToDouble(d -> d).average().orElse(0.0);

        double passMarks = (event.getTotalMarks() != null ? event.getTotalMarks() : 0.0) * 0.4;
        long passCount = scores.stream().filter(s -> s >= passMarks).count();
        double passPercentage = (passCount * 100.0) / totalAttempts;

        List<TopPerformerDTO> topPerformers = new ArrayList<>();
        for (int i = 0; i < Math.min(10, submissions.size()); i++) {
            McqSubmission s = submissions.get(i);
            User user = userRepository.findById(s.getUserId()).orElse(null);
            topPerformers.add(new TopPerformerDTO(
                    s.getUserId(),
                    user != null ? user.getUsername() : "Unknown",
                    user != null ? user.getRollNumber() : "N/A",
                    s.getTotalScore(),
                    i + 1
            ));
        }

        return new AdminEventAnalyticsDTO(totalRegistrations, totalAttempts, totalAbsent, average, highest, lowest, passPercentage, topPerformers);
    }
}
