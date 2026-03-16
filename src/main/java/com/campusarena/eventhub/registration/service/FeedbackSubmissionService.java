package com.campusarena.eventhub.registration.service;

import com.campusarena.eventhub.exception.ApiException;
import com.campusarena.eventhub.registration.model.FeedbackSubmission;
import com.campusarena.eventhub.registration.model.RegistrationForm;
import com.campusarena.eventhub.registration.repository.FeedbackSubmissionRepository;
import com.campusarena.eventhub.registration.repository.RegistrationFormRepository;
import com.campusarena.eventhub.registration.repository.RegistrationResponseRepository;
import com.campusarena.eventhub.registration.model.RegistrationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FeedbackSubmissionService {

    private final FeedbackSubmissionRepository feedbackRepository;
    private final RegistrationFormRepository formRepository;
    private final RegistrationResponseRepository responseRepository;

    public FeedbackSubmission submitFeedback(String formId, String userId, String username, Map<String, Object> answers) {
        RegistrationForm form = formRepository.findById(formId)
                .orElseThrow(() -> new ApiException("Registration form not found"));

        if (form.getFeedbackEnabled() == null || !form.getFeedbackEnabled()) {
            throw new ApiException("Feedback is not enabled for this event");
        }

        if (feedbackRepository.existsByFormIdAndUserId(formId, userId)) {
            throw new ApiException("You have already submitted feedback for this event");
        }

        // Check if user is registered and approved
        RegistrationResponse response = responseRepository.findByFormIdAndUserId(formId, userId)
                .orElseThrow(() -> new ApiException("Only registered participants can submit feedback"));
        
        if (!"APPROVED".equals(response.getStatus())) {
            throw new ApiException("Only approved participants can submit feedback");
        }

        FeedbackSubmission submission = FeedbackSubmission.builder()
                .formId(formId)
                .userId(userId)
                .username(username)
                .answers(answers)
                .submittedAt(Instant.now())
                .build();

        return feedbackRepository.save(submission);
    }

    public List<FeedbackSubmission> getFeedbackForForm(String formId) {
        return feedbackRepository.findByFormId(formId);
    }

    public boolean hasSubmittedFeedback(String formId, String userId) {
        return feedbackRepository.existsByFormIdAndUserId(formId, userId);
    }
}
