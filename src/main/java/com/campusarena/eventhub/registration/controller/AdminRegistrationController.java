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

    @PostMapping("/forms")
    public ResponseEntity<RegistrationForm> createForm(
            @RequestParam("form") String formJson,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        RegistrationForm form = objectMapper.readValue(formJson, RegistrationForm.class);
        return ResponseEntity.ok(formService.createForm(form, image));
    }

    @PutMapping("/forms/{id}")
    public ResponseEntity<RegistrationForm> updateForm(
            @PathVariable String id,
            @RequestParam("form") String formJson,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        RegistrationForm form = objectMapper.readValue(formJson, RegistrationForm.class);
        return ResponseEntity.ok(formService.updateForm(id, form, image));
    }

    @DeleteMapping("/forms/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable String id) {
        formService.deleteForm(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/forms/{id}/responses")
    public ResponseEntity<List<RegistrationResponse>> getResponses(@PathVariable String id) {
        return ResponseEntity.ok(responseService.getResponsesForForm(id));
    }

    @PutMapping("/responses/{id}/status")
    public ResponseEntity<RegistrationResponse> updateStatus(
            @PathVariable String id,
            @RequestParam String status) {
        return ResponseEntity.ok(responseService.updateStatus(id, status));
    }
}
