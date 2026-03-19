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
import jakarta.annotation.PostConstruct;
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
    private final com.campusarena.eventhub.user.repository.UserRepository userRepository;


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
        Optional<Report> existingReport = request.getId() != null
                ? reportRepository.findById(request.getId())
                : reportRepository.findByEventIdAndEventType(request.getEventId(), request.getEventType());

        Report.ReportBuilder reportBuilder = Report.builder()
                .id(existingReport.map(Report::getId).orElse(null))
                .eventId(request.getEventId())
                .eventType(request.getEventType())
                .venue(request.getVenue())
                .objective(request.getObjective())
                .socialMediaLinks(request.getSocialMediaLinks())
                .createdAt(existingReport.map(Report::getCreatedAt).orElse(Instant.now()))
                .createdBy(existingReport.map(Report::getCreatedBy).orElse(createdBy));

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
            if (event.getSubClubName() != null) {
                reportBuilder.subClubName(event.getSubClubName());
            }

            // Participants and Winners for Quiz: Sorted by Score Desc, SubmittedAt Asc
            List<EventLeaderboardEntry> leaderboard = eventLeaderboardService.getLeaderboard(event.getId());
            String totalMarks = event.getTotalMarks() != null ? String.valueOf(event.getTotalMarks()) : "N/A";
            
            List<Report.ParticipantInfo> participants;
            Optional<RegistrationForm> regForm = registrationFormRepository.findByEventId(event.getId());
            
            if (regForm.isPresent()) {
                List<RegistrationResponse> responses = registrationResponseRepository.findByFormId(regForm.get().getId());
                
                // Sort responses based on leaderboard performance first, then keep them in the list
                participants = responses.stream()
                        .map(res -> {
                            Optional<EventLeaderboardEntry> entry = leaderboard.stream()
                                    .filter(e -> (e.getUserId() != null && e.getUserId().equals(res.getUserId())) || 
                                                 (e.getUsername() != null && e.getUsername().equals(res.getUsername())))
                                    .findFirst();
                            
                            double scoreVal = entry.map(EventLeaderboardEntry::getScore).orElse(0.0);
                            Instant time = entry.map(EventLeaderboardEntry::getSubmittedAt).orElse(null);
                            
                            return new Object() {
                                final Report.ParticipantInfo info = mapToParticipantInfo(res.getUserId(), 
                                        res.getName() != null ? res.getName() : res.getUsername(), 
                                        res.getRollNumber(), 
                                        (entry.isPresent() ? entry.get().getScore() + " / " + totalMarks : "0 / " + totalMarks));
                                final double score = scoreVal;
                                final Instant submittedAt = time;
                            };
                        })
                        .sorted((a, b) -> {
                            if (b.score != a.score) return Double.compare(b.score, a.score);
                            if (a.submittedAt == null && b.submittedAt == null) return 0;
                            if (a.submittedAt == null) return 1;
                            if (b.submittedAt == null) return -1;
                            return a.submittedAt.compareTo(b.submittedAt);
                        })
                        .map(wrapper -> wrapper.info)
                        .collect(Collectors.toList());
            } else {
                participants = leaderboard.stream()
                        .map(entry -> mapToParticipantInfo(entry.getUserId(), entry.getUsername(), entry.getRollNumber(), entry.getScore() + " / " + totalMarks))
                        .collect(Collectors.toList());
            }

            reportBuilder.participants(participants);
            reportBuilder.winners(participants.stream()
                    .filter(p -> !p.getScore().startsWith("0 /")) // Ensure winners actually scored points
                    .limit(3)
                    .collect(Collectors.toList()));

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
            if (contest.getSubClubName() != null) {
                reportBuilder.subClubName(contest.getSubClubName());
            }

            // Participants and Winners for Contest: Sorted by Score Desc, LastSubmissionTime Asc
            List<LeaderboardEntry> leaderboard = contestLeaderboardService.getLeaderboard(contest.getId());
            
            List<Report.ParticipantInfo> participants;
            Optional<RegistrationForm> regForm = registrationFormRepository.findByContestId(contest.getId());
            
            if (regForm.isPresent()) {
                List<RegistrationResponse> responses = registrationResponseRepository.findByFormId(regForm.get().getId());
                
                participants = responses.stream()
                        .map(res -> {
                            Optional<LeaderboardEntry> entry = leaderboard.stream()
                                    .filter(e -> (e.getUserId() != null && e.getUserId().equals(res.getUserId())) || 
                                                 (e.getUsername() != null && e.getUsername().equals(res.getUsername())))
                                    .findFirst();
                            
                            int scoreVal = entry.map(LeaderboardEntry::getTotalScore).orElse(0);
                            Instant time = entry.map(LeaderboardEntry::getLastSubmissionTime).orElse(null);
                            
                            return new Object() {
                                final Report.ParticipantInfo info = mapToParticipantInfo(res.getUserId(), 
                                        res.getName() != null ? res.getName() : res.getUsername(), 
                                        res.getRollNumber(), 
                                        (entry.isPresent() 
                                                ? entry.get().getTotalScore() + " pts (" + entry.get().getProblemsSolved() + " solved)"
                                                : "0 pts (0 solved)"));
                                final int score = scoreVal;
                                final Instant lastTime = time;
                            };
                        })
                        .sorted((a, b) -> {
                            if (b.score != a.score) return Integer.compare(b.score, a.score);
                            if (a.lastTime == null && b.lastTime == null) return 0;
                            if (a.lastTime == null) return 1;
                            if (b.lastTime == null) return -1;
                            return a.lastTime.compareTo(b.lastTime);
                        })
                        .map(wrapper -> wrapper.info)
                        .collect(Collectors.toList());
            } else {
                participants = leaderboard.stream()
                        .map(entry -> mapToParticipantInfo(entry.getUserId(), entry.getUsername(), entry.getRollNumber(), 
                                entry.getTotalScore() + " pts (" + entry.getProblemsSolved() + " solved)"))
                        .collect(Collectors.toList());
            }

            reportBuilder.participants(participants);
            reportBuilder.winners(participants.stream()
                    .filter(p -> !p.getScore().startsWith("0 pts")) // Ensure winners actually solved something
                    .limit(3)
                    .collect(Collectors.toList()));

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
            if (form.getSubClubName() != null) {
                reportBuilder.subClubName(form.getSubClubName());
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


            // Participants: Sorted by Performance from linked Quiz/Contest
            List<RegistrationResponse> responses = registrationResponseRepository.findByFormId(form.getId());
            List<Report.ParticipantInfo> participants;
            
            // Fetch scores from linked event/contest if they exist for attendance
            if (form.getEventId() != null) {
                Event event = eventRepository.findById(form.getEventId()).orElse(null);
                List<EventLeaderboardEntry> leaderboard = eventLeaderboardService.getLeaderboard(form.getEventId());
                String totalMarks = (event != null && event.getTotalMarks() != null) ? String.valueOf(event.getTotalMarks()) : "N/A";
                
                participants = responses.stream().map(res -> {
                    Optional<EventLeaderboardEntry> entry = leaderboard.stream()
                        .filter(e -> (e.getUserId() != null && e.getUserId().equals(res.getUserId())) || 
                                     (e.getUsername() != null && e.getUsername().equals(res.getUsername())))
                        .findFirst();
                    
                    double scoreVal = entry.map(EventLeaderboardEntry::getScore).orElse(0.0);
                    Instant time = entry.map(EventLeaderboardEntry::getSubmittedAt).orElse(null);
                    
                    return new Object() {
                        final Report.ParticipantInfo info = mapToParticipantInfo(res.getUserId(), 
                                res.getName() != null ? res.getName() : res.getUsername(), 
                                res.getRollNumber(), 
                                (entry.isPresent() ? entry.get().getScore() + " / " + totalMarks : "0 / " + totalMarks));
                        final double score = scoreVal;
                        final Instant submittedAt = time;
                    };
                })
                .sorted((a, b) -> {
                    if (b.score != a.score) return Double.compare(b.score, a.score);
                    if (a.submittedAt == null && b.submittedAt == null) return 0;
                    if (a.submittedAt == null) return 1;
                    if (b.submittedAt == null) return -1;
                    return a.submittedAt.compareTo(b.submittedAt);
                })
                .map(wrapper -> wrapper.info)
                .collect(Collectors.toList());
            } else if (form.getContestId() != null) {
                List<LeaderboardEntry> leaderboard = contestLeaderboardService.getLeaderboard(form.getContestId());
                participants = responses.stream().map(res -> {
                    Optional<LeaderboardEntry> entry = leaderboard.stream()
                        .filter(e -> (e.getUserId() != null && e.getUserId().equals(res.getUserId())) || 
                                     (e.getUsername() != null && e.getUsername().equals(res.getUsername())))
                        .findFirst();
                    
                    int scoreVal = entry.map(LeaderboardEntry::getTotalScore).orElse(0);
                    Instant time = entry.map(LeaderboardEntry::getLastSubmissionTime).orElse(null);
                    
                    return new Object() {
                        final Report.ParticipantInfo info = mapToParticipantInfo(res.getUserId(), 
                                res.getName() != null ? res.getName() : res.getUsername(), 
                                res.getRollNumber(), 
                                (entry.isPresent() 
                                    ? entry.get().getTotalScore() + " pts (" + entry.get().getProblemsSolved() + " solved)"
                                    : "0 pts (0 solved)"));
                        final int score = scoreVal;
                        final Instant lastTime = time;
                    };
                })
                .sorted((a, b) -> {
                    if (b.score != a.score) return Integer.compare(b.score, a.score);
                    if (a.lastTime == null && b.lastTime == null) return 0;
                    if (a.lastTime == null) return 1;
                    if (b.lastTime == null) return -1;
                    return a.lastTime.compareTo(b.lastTime);
                })
                .map(wrapper -> wrapper.info)
                .collect(Collectors.toList());
            } else {
                participants = responses.stream()
                        .map(this::mapResponseToParticipantInfo)
                        .sorted((a, b) -> {
                            // Sort by score string if numeric score not available (basic fallback)
                            return b.getScore().compareTo(a.getScore());
                        })
                        .collect(Collectors.toList());
            }
            
            reportBuilder.participants(participants);
            
            // Winners: Top 3 from sorted list
            reportBuilder.winners(participants.stream()
                    .filter(p -> !p.getScore().startsWith("0 /") && !p.getScore().startsWith("0 pts"))
                    .limit(3)
                    .collect(Collectors.toList()));
        }

        Report report = reportBuilder.build();
        return reportRepository.save(report);
    }

    private Report.ParticipantInfo mapResponseToParticipantInfo(RegistrationResponse res) {
        String scoreStr = (res.getTotalEvaluationMarks() != null && res.getMaxPossibleMarks() != null)
                ? res.getTotalEvaluationMarks() + " / " + res.getMaxPossibleMarks()
                : (res.getTotalEvaluationMarks() != null ? String.valueOf(res.getTotalEvaluationMarks()) : "N/A");

        if (res.getUserId() != null) {
            return userRepository.findById(res.getUserId())
                    .map(user -> Report.ParticipantInfo.builder()
                            .name((user.getFirstName() != null ? user.getFirstName() : "") + " " +
                                    (user.getLastName() != null ? user.getLastName() : ""))
                            .rollNumber(user.getRollNumber())
                            .course(user.getCourse() != null ? user.getCourse().name() : "N/A")
                            .branch(user.getBranch() != null ? user.getBranch().name() : "N/A")
                            .section(user.getSection())
                            .score(scoreStr)
                            .build())
                    .orElseGet(() -> Report.ParticipantInfo.builder()
                            .name(res.getName() != null ? res.getName() : (res.getUsername() != null ? res.getUsername() : "Unknown"))
                            .rollNumber(res.getRollNumber())
                            .course(res.getCourse())
                            .branch(res.getBranch())
                            .section(res.getSection())
                            .score(scoreStr)
                            .build());
        }

        return Report.ParticipantInfo.builder()
                .name(res.getName() != null ? res.getName() : (res.getUsername() != null ? res.getUsername() : "Unknown"))
                .rollNumber(res.getRollNumber())
                .course(res.getCourse())
                .branch(res.getBranch())
                .section(res.getSection())
                .score(scoreStr)
                .build();
    }

    private Report.ParticipantInfo mapToParticipantInfo(String userId, String username, String rollNumber, String score) {
        // Try looking up by userId first for maximum reliability
        return (userId != null ? userRepository.findById(userId) : userRepository.findByUsername(username))
                .map(user -> Report.ParticipantInfo.builder()
                        .name(((user.getFirstName() != null ? user.getFirstName() : "") + " " +
                                (user.getLastName() != null ? user.getLastName() : "")).trim())
                        .rollNumber(user.getRollNumber() != null ? user.getRollNumber() : rollNumber)
                        .course(user.getCourse() != null ? user.getCourse().name() : "N/A")
                        .branch(user.getBranch() != null ? user.getBranch().name() : "N/A")
                        .section(user.getSection())
                        .score(score)
                        .build())
                .orElseGet(() -> {
                    // Fallback to provided leaderboard data if user document not found
                    return Report.ParticipantInfo.builder()
                            .name(username)
                            .rollNumber(rollNumber != null ? rollNumber : "N/A")
                            .course("N/A")
                            .branch("N/A")
                            .score(score)
                            .build();
                });
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public void deleteAllReports() {
        reportRepository.deleteAll();
    }

    public Report getReportById(String id) {
        return reportRepository.findById(id).orElseThrow(() -> new RuntimeException("Report not found"));
    }

    public void deleteReport(String id) {
        if (!reportRepository.existsById(id)) {
            throw new RuntimeException("Report not found");
        }
        reportRepository.deleteById(id);
    }

    public Optional<Report> getReportByEventIdAndType(String eventId, String eventType) {
        return reportRepository.findByEventIdAndEventType(eventId, eventType);
    }
}
