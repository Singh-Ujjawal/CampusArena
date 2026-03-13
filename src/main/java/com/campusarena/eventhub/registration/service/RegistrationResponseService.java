package com.campusarena.eventhub.registration.service;

import com.campusarena.eventhub.contest.model.Contest;
import com.campusarena.eventhub.contest.repository.ContestRepository;
import com.campusarena.eventhub.event.model.Event;
import com.campusarena.eventhub.event.repository.EventRepository;
import com.campusarena.eventhub.exception.ApiException;
import com.campusarena.eventhub.user.model.User;
import com.campusarena.eventhub.user.model.Roles;
import com.campusarena.eventhub.registration.model.EvaluationMark;
import com.campusarena.eventhub.registration.model.Question;
import com.campusarena.eventhub.registration.model.QuestionType;
import com.campusarena.eventhub.registration.model.RegistrationForm;
import com.campusarena.eventhub.registration.model.RegistrationResponse;
import com.campusarena.eventhub.registration.repository.RegistrationFormRepository;
import com.campusarena.eventhub.registration.repository.RegistrationResponseRepository;
import com.campusarena.eventhub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrationResponseService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.max-size}")
    private long maxFileSize;

    private final RegistrationFormRepository formRepository;
    private final RegistrationResponseRepository responseRepository;
    private final EventRepository eventRepository;
    private final ContestRepository contestRepository;
    private final UserRepository userRepository;

    public RegistrationResponse submit(String formId, RegistrationResponse response) {
        RegistrationForm form = formRepository.findById(formId)
                .orElseThrow(() -> new ApiException("Form not found"));
        Instant now = Instant.now();

        // Check if event or contest has started
        checkIfStarted(form, now);

        if (!form.isActive() || now.isBefore(form.getStartTime())
                || (form.getEndTime() != null && now.isAfter(form.getEndTime()))) {
            throw new ApiException("Registration form is closed");
        }

        if (response.getUserId() != null && responseRepository.existsByFormIdAndUserId(formId, response.getUserId())) {
            throw new ApiException("You have already registered using this form");
        }

        response.setFormId(formId);
        response.setSubmittedAt(now);
        response.setStatus("PENDING");
        return responseRepository.save(response);
    }

    public RegistrationResponse submitWithFiles(String formId, String userId, Map<String, String> textAnswers,
            Map<String, MultipartFile> files) throws IOException {
        RegistrationForm form = formRepository.findById(formId)
                .orElseThrow(() -> new ApiException("Form not found"));
        Instant now = Instant.now();

        // Check if event or contest has started
        checkIfStarted(form, now);

        if (!form.isActive() || now.isBefore(form.getStartTime())
                || (form.getEndTime() != null && now.isAfter(form.getEndTime()))) {
            throw new ApiException("Registration form is closed");
        }

        if (userId != null && responseRepository.existsByFormIdAndUserId(formId, userId)) {
            throw new ApiException("You have already registered using this form");
        }

        Map<String, Object> finalAnswers = new HashMap<>();
        for (Question question : form.getQuestions()) {
            String qId = question.getId();
            if (question.getType() == QuestionType.IMAGE_UPLOAD) {
                MultipartFile file = (files != null) ? files.get(qId) : null;
                String textValue = textAnswers.get(qId);
                
                if (question.isRequired() && (file == null || file.isEmpty()) && (textValue == null || textValue.trim().isEmpty())) {
                    throw new ApiException("Required image missing: " + question.getLabel());
                }
                
                if (file != null && !file.isEmpty()) {
                    if (file.getSize() > maxFileSize) {
                        throw new ApiException("File size exceeds limit (Max 2MB)");
                    }
                    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                    Path path = Paths.get(uploadDir, fileName);
                    Files.createDirectories(path.getParent());
                    Files.copy(file.getInputStream(), path);
                    finalAnswers.put(qId, "/files/" + fileName);
                } else if (textValue != null && !textValue.trim().isEmpty()) {
                    finalAnswers.put(qId, textValue);
                }
            } else {
                String value = textAnswers.get(qId);
                if (question.isRequired() && (value == null || value.trim().isEmpty())) {
                    throw new ApiException("Required question missing: " + question.getLabel());
                }
                finalAnswers.put(qId, value);
            }
        }

        RegistrationResponse response = RegistrationResponse.builder()
                .formId(formId)
                .userId(userId)
                .answers(finalAnswers)
                .submittedAt(now)
                .status("PENDING")
                .build();

        return responseRepository.save(response);
    }

    public RegistrationResponse updateStatus(String id, String status, User currentUser) {
        RegistrationResponse response = responseRepository.findById(id)
                .orElseThrow(() -> new ApiException("Response not found"));
        
        RegistrationForm form = formRepository.findById(response.getFormId())
                .orElseThrow(() -> new ApiException("Form not found"));

        if (currentUser != null && currentUser.getRole() == Roles.FACULTY) {
            if (!currentUser.getUsername().equals(form.getCreatedBy())) {
                throw new ApiException("Access Denied: You can only update response status for forms you created.");
            }
        }
        
        response.setStatus(status);
        return responseRepository.save(response);
    }

    public List<RegistrationResponse> getResponsesForForm(String formId, User currentUser) {
        RegistrationForm form = formRepository.findById(formId)
                .orElseThrow(() -> new ApiException("Form not found"));

        if (currentUser != null && currentUser.getRole() == Roles.FACULTY) {
            if (!currentUser.getUsername().equals(form.getCreatedBy())) {
                throw new ApiException("Access Denied: You can only view responses for forms you created.");
            }
        }

        List<RegistrationResponse> responses = responseRepository.findByFormId(formId);
        for (RegistrationResponse response : responses) {
            if (response.getUserId() != null) {
                userRepository.findById(response.getUserId()).ifPresent(user -> {
                    response.setUsername(user.getUsername());
                    response.setRollNumber(user.getRollNumber());
                    response.setName((user.getFirstName() != null ? user.getFirstName() : "") + " " +
                            (user.getLastName() != null ? user.getLastName() : ""));
                    response.setEmail(user.getEmail());
                    response.setPhoneNumber(user.getPhoneNumber());
                    response.setCourse(user.getCourse() != null ? user.getCourse().name() : "");
                    response.setBranch(user.getBranch() != null ? user.getBranch().name() : "");
                    response.setSection(user.getSection());
                });
            }
        }
        return responses;
    }

    public String getRegistrationStatusForEvent(String eventId, String userId) {
        return formRepository.findByEventId(eventId)
                .flatMap(form -> responseRepository.findByFormIdAndUserId(form.getId(), userId)
                        .map(RegistrationResponse::getStatus))
                .orElse(null);
    }

    public String getRegistrationStatusForContest(String contestId, String userId) {
        return formRepository.findByContestId(contestId)
                .flatMap(form -> responseRepository.findByFormIdAndUserId(form.getId(), userId)
                        .map(RegistrationResponse::getStatus))
                .orElse(null);
    }

    private void checkIfStarted(RegistrationForm form, Instant now) {
        if (form.getContestId() != null) {
            contestRepository.findById(form.getContestId()).ifPresent(contest -> {
                if (contest.getStartTime() != null && !now.isBefore(contest.getStartTime())) {
                    throw new ApiException(
                            "Registration closed. Contest " + contest.getTitle() + " has already started.");
                }
            });
        }

        if (form.getEventId() != null) {
            eventRepository.findById(form.getEventId()).ifPresent(event -> {
                if (event.getStartTime() != null && !now.isBefore(event.getStartTime())) {
                    throw new ApiException(
                            "Registration closed. Quiz/Event " + event.getTitle() + " has already started.");
                }
            });
        }

    }

    public RegistrationResponse submitMarks(String responseId, List<EvaluationMark> marks, String feedback,
            User currentUser) {
        RegistrationResponse response = responseRepository.findById(responseId)
                .orElseThrow(() -> new ApiException("Response not found"));

        RegistrationForm form = formRepository.findById(response.getFormId())
                .orElseThrow(() -> new ApiException("Form not found"));

        if (currentUser != null && currentUser.getRole() == Roles.FACULTY) {
            if (!currentUser.getUsername().equals(form.getCreatedBy())) {
                throw new ApiException("Access Denied: You can only give marks for responses to forms you created.");
            }
        }

        double totalScore = marks.stream().mapToDouble(EvaluationMark::getMarksObtained).sum();
        double maxPossibleMarks = form.getEvaluationCriteria().stream()
                .mapToDouble(c -> c.getMaxMarks() != null ? c.getMaxMarks() : 0.0)
                .sum();

        response.setEvaluationMarks(marks);
        response.setTotalEvaluationMarks(totalScore);
        response.setMaxPossibleMarks(maxPossibleMarks);
        response.setEvaluationFeedback(feedback);
        response.setEvaluationStatus("GRADED");
        response.setGradedBy(currentUser != null ? currentUser.getUsername() : "ADMIN");
        response.setGradedAt(Instant.now());

        return responseRepository.save(response);
    }
}
