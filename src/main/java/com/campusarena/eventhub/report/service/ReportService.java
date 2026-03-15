package com.campusarena.eventhub.report.service;

import com.campusarena.eventhub.club.model.Club;
import com.campusarena.eventhub.club.repository.ClubRepository;
import com.campusarena.eventhub.contest.model.Contest;
import com.campusarena.eventhub.contest.repository.ContestRepository;
import com.campusarena.eventhub.event.model.Event;
import com.campusarena.eventhub.event.repository.EventRepository;
import com.campusarena.eventhub.registration.model.RegistrationForm;
import com.campusarena.eventhub.registration.repository.RegistrationFormRepository;
import com.campusarena.eventhub.registration.model.RegistrationResponse;
import com.campusarena.eventhub.registration.repository.RegistrationResponseRepository;
import com.campusarena.eventhub.report.dto.ReportRequest;
import com.campusarena.eventhub.report.model.Report;
import com.campusarena.eventhub.report.repository.ReportRepository;
import com.campusarena.eventhub.event.service.EventLeaderboardService;
import com.campusarena.eventhub.event.dto.EventLeaderboardEntry;
import com.campusarena.eventhub.contest.service.LeaderboardService;
import com.campusarena.eventhub.contest.dto.LeaderboardEntry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final EventRepository eventRepository;
    private final ContestRepository contestRepository;
    private final RegistrationFormRepository registrationFormRepository;
    private final RegistrationResponseRepository registrationResponseRepository;
    private final ClubRepository clubRepository;
    private final EventLeaderboardService eventLeaderboardService;
    private final LeaderboardService contestLeaderboardService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy")
            .withZone(ZoneId.of("Asia/Kolkata"));
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a")
            .withZone(ZoneId.of("Asia/Kolkata"));

    public Report generateReport(ReportRequest request, String createdBy) {
        Report.ReportBuilder reportBuilder = Report.builder()
                .eventId(request.getEventId())
                .eventType(request.getEventType())
                .venue(request.getVenue())
                .objective(request.getObjective())
                .socialMediaLinks(request.getSocialMediaLinks())
                .createdAt(Instant.now())
                .createdBy(createdBy);

        if ("QUIZ".equalsIgnoreCase(request.getEventType())) {
            Event event = eventRepository.findById(request.getEventId())
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            reportBuilder.eventName(event.getTitle())
                    .date(event.getStartTime())
                    .time(TIME_FORMATTER.format(event.getStartTime()) + " - " + TIME_FORMATTER.format(event.getEndTime()))
                    .description(event.getDescription())
                    .facultyCoordinators(event.getFacultyCoordinators())
                    .studentCoordinators(event.getStudentCoordinators());

            if (event.getClubId() != null) {
                clubRepository.findById(event.getClubId()).ifPresent(club -> reportBuilder.clubName(club.getName()));
            }

            // Participants and Winners for Quiz
            List<EventLeaderboardEntry> leaderboard = eventLeaderboardService.getLeaderboard(event.getId());
            reportBuilder.participants(leaderboard.stream().map(EventLeaderboardEntry::getUsername).collect(Collectors.toList()));
            reportBuilder.winners(leaderboard.stream().limit(3).map(EventLeaderboardEntry::getUsername).collect(Collectors.toList()));

        } else if ("CONTEST".equalsIgnoreCase(request.getEventType())) {
            Contest contest = contestRepository.findById(request.getEventId())
                    .orElseThrow(() -> new RuntimeException("Contest not found"));
            reportBuilder.eventName(contest.getTitle())
                    .date(contest.getStartTime())
                    .time(TIME_FORMATTER.format(contest.getStartTime()) + " - " + TIME_FORMATTER.format(contest.getEndTime()))
                    .description("Coding Contest")
                    .facultyCoordinators(contest.getFacultyCoordinators())
                    .studentCoordinators(contest.getStudentCoordinators());

            if (contest.getClubId() != null) {
                clubRepository.findById(contest.getClubId()).ifPresent(club -> reportBuilder.clubName(club.getName()));
            }

            // Participants and Winners for Contest
            List<LeaderboardEntry> leaderboard = contestLeaderboardService.getLeaderboard(contest.getId());
            reportBuilder.participants(leaderboard.stream().map(LeaderboardEntry::getUsername).collect(Collectors.toList()));
            reportBuilder.winners(leaderboard.stream().limit(3).map(LeaderboardEntry::getUsername).collect(Collectors.toList()));

        } else if ("REGISTRATION".equalsIgnoreCase(request.getEventType())) {
            RegistrationForm form = registrationFormRepository.findById(request.getEventId())
                    .orElseThrow(() -> new RuntimeException("Registration form not found"));
            reportBuilder.eventName(form.getTitle())
                    .date(form.getStartTime())
                    .time(TIME_FORMATTER.format(form.getStartTime()) + " - " + (form.getEndTime() != null ? TIME_FORMATTER.format(form.getEndTime()) : "N/A"))
                    .description(form.getDescription());


            if (form.getClubId() != null) {
                clubRepository.findById(form.getClubId()).ifPresent(club -> reportBuilder.clubName(club.getName()));
            }

            // Fetch coordinators from linked event/contest if exists
            if (form.getEventId() != null) {
                eventRepository.findById(form.getEventId()).ifPresent(event -> {
                    reportBuilder.facultyCoordinators(event.getFacultyCoordinators());
                    reportBuilder.studentCoordinators(event.getStudentCoordinators());
                });
            } else if (form.getContestId() != null) {
                contestRepository.findById(form.getContestId()).ifPresent(contest -> {
                    reportBuilder.facultyCoordinators(contest.getFacultyCoordinators());
                    reportBuilder.studentCoordinators(contest.getStudentCoordinators());
                });
            }


            // Participants: Those who registered
            List<RegistrationResponse> responses = registrationResponseRepository.findByFormId(form.getId());
            reportBuilder.participants(responses.stream().map(RegistrationResponse::getName).collect(Collectors.toList()));
            
            // Winners: Those with highest evaluation marks (if any)
            List<RegistrationResponse> winners = responses.stream()
                    .filter(r -> r.getTotalEvaluationMarks() != null)
                    .sorted((a, b) -> Double.compare(b.getTotalEvaluationMarks(), a.getTotalEvaluationMarks()))
                    .limit(3)
                    .collect(Collectors.toList());
            reportBuilder.winners(winners.stream().map(RegistrationResponse::getName).collect(Collectors.toList()));
        }

        Report report = reportBuilder.build();
        return reportRepository.save(report);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public Report getReportById(String id) {
        return reportRepository.findById(id).orElseThrow(() -> new RuntimeException("Report not found"));
    }

    public Optional<Report> getReportByEventIdAndType(String eventId, String eventType) {
        return reportRepository.findByEventIdAndEventType(eventId, eventType);
    }
}
