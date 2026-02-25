package com.campusarena.eventhub.registration.service;

import com.campusarena.eventhub.registration.model.Question;
import com.campusarena.eventhub.registration.model.QuestionType;
import com.campusarena.eventhub.registration.model.RegistrationForm;
import com.campusarena.eventhub.registration.model.RegistrationResponse;
import com.campusarena.eventhub.registration.repository.RegistrationFormRepository;
import com.campusarena.eventhub.registration.repository.RegistrationResponseRepository;
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

    public RegistrationResponse submit(String formId, RegistrationResponse response) {
        RegistrationForm form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        Instant now = Instant.now();
        if (!form.isActive() || now.isBefore(form.getStartTime()) || (form.getEndTime() != null && now.isAfter(form.getEndTime()))) {
            throw new RuntimeException("Registration form is closed");
        }
        
        if (response.getUserId() != null && responseRepository.existsByFormIdAndUserId(formId, response.getUserId())) {
            throw new RuntimeException("You have already registered using this form");
        }

        response.setFormId(formId);
        response.setSubmittedAt(now);
        response.setStatus("PENDING");
        return responseRepository.save(response);
    }

    public RegistrationResponse submitWithFiles(String formId, String userId, Map<String, String> textAnswers, Map<String, MultipartFile> files) throws IOException {
        RegistrationForm form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        Instant now = Instant.now();
        
        if (!form.isActive() || now.isBefore(form.getStartTime()) || (form.getEndTime() != null && now.isAfter(form.getEndTime()))) {
            throw new RuntimeException("Registration form is closed");
        }
        
        if (userId != null && responseRepository.existsByFormIdAndUserId(formId, userId)) {
            throw new RuntimeException("You have already registered using this form");
        }

        Map<String, Object> finalAnswers = new HashMap<>();
        for (Question question : form.getQuestions()) {
            String qId = question.getId();
            if (question.getType() == QuestionType.IMAGE_UPLOAD) {
                MultipartFile file = (files != null) ? files.get(qId) : null;
                if (question.isRequired() && (file == null || file.isEmpty())) {
                    throw new RuntimeException("Required image missing: " + question.getLabel());
                }
                if (file != null && !file.isEmpty()) {
                    if (file.getSize() > maxFileSize) {
                        throw new RuntimeException("File size exceeds limit (Max 2MB)");
                    }
                    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                    Path path = Paths.get(uploadDir, fileName);
                    Files.createDirectories(path.getParent());
                    Files.copy(file.getInputStream(), path);
                    finalAnswers.put(qId, "/files/" + fileName);
                }
            } else {
                String value = textAnswers.get(qId);
                if (question.isRequired() && (value == null || value.trim().isEmpty())) {
                    throw new RuntimeException("Required question missing: " + question.getLabel());
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
    
    public RegistrationResponse updateStatus(String id, String status) {
        RegistrationResponse response = responseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Response not found"));
        response.setStatus(status);
        return responseRepository.save(response);
    }

    public List<RegistrationResponse> getResponsesForForm(String formId) {
        return responseRepository.findByFormId(formId);
    }
    
    public boolean isUserRegisteredForEvent(String eventId, String userId) {
        return formRepository.findByEventId(eventId)
                .map(form -> responseRepository.existsByFormIdAndUserId(form.getId(), userId))
                .orElse(false); // If registration is required but no form exists, they can't be registered
    }
    
    public boolean isUserRegisteredForContest(String contestId, String userId) {
        return formRepository.findByContestId(contestId)
                .map(form -> responseRepository.existsByFormIdAndUserId(form.getId(), userId))
                .orElse(false);
    }
}
