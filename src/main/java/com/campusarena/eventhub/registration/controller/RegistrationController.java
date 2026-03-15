package com.campusarena.eventhub.registration.controller;

import com.campusarena.eventhub.registration.model.EvaluationCriterion;
import com.campusarena.eventhub.registration.model.EvaluationMark;
import com.campusarena.eventhub.registration.model.RegistrationForm;
import com.campusarena.eventhub.registration.model.RegistrationResponse;
import com.campusarena.eventhub.registration.service.RegistrationFormService;
import com.campusarena.eventhub.registration.service.RegistrationResponseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registration")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationFormService formService;
    private final RegistrationResponseService responseService;
    private final com.campusarena.eventhub.user.service.SecurityService securityService;

    @GetMapping("/forms")
    public ResponseEntity<List<RegistrationForm>> getAllForms(@RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(formService.getAllForms(securityService.getCurrentUser(auth)));
    }

    @GetMapping("/forms/{id}")
    public ResponseEntity<RegistrationForm> getForm(@PathVariable String id) {
        return ResponseEntity.ok(formService.getForm(id));
    }

    @GetMapping("/forms/event/{eventId}")
    public ResponseEntity<RegistrationForm> getFormByEventId(@PathVariable String eventId) {
        return ResponseEntity.ok(formService.getFormByEventId(eventId));
    }

    @GetMapping("/forms/contest/{contestId}")
    public ResponseEntity<RegistrationForm> getFormByContestId(@PathVariable String contestId) {
        return ResponseEntity.ok(formService.getFormByContestId(contestId));
    }

    @GetMapping("/responses/check")
    public ResponseEntity<String> checkRegistrationStatus(
            @RequestParam(required = false) String eventId,
            @RequestParam(required = false) String contestId,
            @RequestParam(required = false) String formId,
            @RequestParam String userId) {
        if (eventId != null) {
            return ResponseEntity.ok(responseService.getRegistrationStatusForEvent(eventId, userId));
        } else if (contestId != null) {
            return ResponseEntity.ok(responseService.getRegistrationStatusForContest(contestId, userId));
        } else if (formId != null) {
            return ResponseEntity.ok(responseService.getRegistrationStatusForForm(formId, userId));
        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/forms/{id}/submit")
    public ResponseEntity<RegistrationResponse> submitForm(
            @PathVariable String id,
            @RequestParam(required = false) String userId,
            org.springframework.web.multipart.MultipartHttpServletRequest request) throws IOException {

        Map<String, String[]> parameterMap = request.getParameterMap();
        Map<String, String> textAnswers = new java.util.HashMap<>();
        parameterMap.forEach((key, values) -> {
            if (!key.equals("userId")) {
                textAnswers.put(key, values[0]);
            }
        });

        return ResponseEntity.ok(responseService.submitWithFiles(id, userId, textAnswers, request.getFileMap()));
    }

    @PutMapping("/forms/{id}/evaluation-criteria")
    public ResponseEntity<RegistrationForm> updateEvaluationCriteria(
            @PathVariable String id,
            @RequestBody List<EvaluationCriterion> criteria,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(formService.updateEvaluationCriteria(id, criteria, securityService.getCurrentUser(auth)));
    }

    @GetMapping("/forms/{id}/responses")
    public ResponseEntity<List<RegistrationResponse>> getFormResponses(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(responseService.getResponsesForForm(id, securityService.getCurrentUser(auth)));
    }

    @PutMapping("/responses/{id}/marks")
    public ResponseEntity<RegistrationResponse> submitMarks(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        
        List<Map<String, Object>> marksList = (List<Map<String, Object>>) payload.get("marks");
        String feedback = (String) payload.get("feedback");
        
        List<EvaluationMark> marks = marksList.stream()
                .map(m -> EvaluationMark.builder()
                        .criterionId((String) m.get("criterionId"))
                        .criterionName((String) m.get("criterionName"))
                        .marksObtained(Double.valueOf(m.get("marksObtained").toString()))
                        .build())
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(responseService.submitMarks(id, marks, feedback, securityService.getCurrentUser(auth)));
    }
}
