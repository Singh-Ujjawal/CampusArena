package com.campusarena.eventhub.registration.controller;

import com.campusarena.eventhub.registration.model.FeedbackSubmission;
import com.campusarena.eventhub.registration.service.FeedbackSubmissionService;
import com.campusarena.eventhub.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackSubmissionController {

    private final FeedbackSubmissionService feedbackService;
    private final com.campusarena.eventhub.user.service.SecurityService securityService;

    @PostMapping("/{formId}/submit")
    public ResponseEntity<FeedbackSubmission> submitFeedback(
            @PathVariable String formId,
            @RequestBody Map<String, Object> answers) {
        
        User user = securityService.getCurrentUser(null);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        FeedbackSubmission submission = feedbackService.submitFeedback(
                formId, user.getId(), user.getUsername(), answers);
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/{formId}/responses")
    public ResponseEntity<List<FeedbackSubmission>> getFeedbackResponses(@PathVariable String formId) {
        return ResponseEntity.ok(feedbackService.getFeedbackForForm(formId));
    }

    @GetMapping("/{formId}/status")
    public ResponseEntity<Boolean> getFeedbackStatus(@PathVariable String formId) {
        User user = securityService.getCurrentUser(null);
        if (user == null) {
            return ResponseEntity.ok(false);
        }
        return ResponseEntity.ok(feedbackService.hasSubmittedFeedback(formId, user.getId()));
    }
}
