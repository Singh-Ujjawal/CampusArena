package com.campusarena.eventhub.registration.controller;

import com.campusarena.eventhub.registration.model.RegistrationForm;
import com.campusarena.eventhub.registration.model.RegistrationResponse;
import com.campusarena.eventhub.registration.service.RegistrationFormService;
import com.campusarena.eventhub.registration.service.RegistrationResponseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/registration")
@RequiredArgsConstructor
public class AdminRegistrationController {

    private final RegistrationFormService formService;
    private final RegistrationResponseService responseService;
    private final ObjectMapper objectMapper;
    private final com.campusarena.eventhub.user.service.SecurityService securityService;

    @PostMapping("/forms")
    public ResponseEntity<RegistrationForm> createForm(
            @RequestParam("form") String formJson,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestHeader(value = "Authorization", required = false) String auth) throws IOException {
        RegistrationForm form = objectMapper.readValue(formJson, RegistrationForm.class);
        return ResponseEntity.ok(formService.createForm(form, image, securityService.getCurrentUser(auth)));
    }

    @PutMapping("/forms/{id}")
    public ResponseEntity<RegistrationForm> updateForm(
            @PathVariable String id,
            @RequestParam("form") String formJson,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestHeader(value = "Authorization", required = false) String auth) throws IOException {
        RegistrationForm form = objectMapper.readValue(formJson, RegistrationForm.class);
        return ResponseEntity.ok(formService.updateForm(id, form, image, securityService.getCurrentUser(auth)));
    }

    @DeleteMapping("/forms/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String auth) {
        formService.deleteForm(id, securityService.getCurrentUser(auth));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/forms/{id}/responses")
    public ResponseEntity<List<RegistrationResponse>> getResponses(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(responseService.getResponsesForForm(id, securityService.getCurrentUser(auth)));
    }

    @PutMapping("/responses/{id}/status")
    public ResponseEntity<RegistrationResponse> updateStatus(
            @PathVariable String id,
            @RequestParam String status,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(responseService.updateStatus(id, status, securityService.getCurrentUser(auth)));
    }
}
