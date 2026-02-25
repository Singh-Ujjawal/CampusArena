package com.campusarena.eventhub.registration.controller;

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

    @GetMapping("/forms")
    public ResponseEntity<List<RegistrationForm>> getAllForms() {
        return ResponseEntity.ok(formService.getAllForms());
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
            @RequestParam String userId) {
        if (eventId != null) {
            return ResponseEntity.ok(responseService.getRegistrationStatusForEvent(eventId, userId));
        } else if (contestId != null) {
            return ResponseEntity.ok(responseService.getRegistrationStatusForContest(contestId, userId));
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
}
