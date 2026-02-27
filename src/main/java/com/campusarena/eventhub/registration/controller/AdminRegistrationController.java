package com.campusarena.eventhub.registration.controller;

import com.campusarena.eventhub.registration.model.RegistrationForm;
import com.campusarena.eventhub.registration.model.RegistrationResponse;
import com.campusarena.eventhub.registration.service.RegistrationFormService;
import com.campusarena.eventhub.registration.service.RegistrationResponseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/registration")
@RequiredArgsConstructor
public class AdminRegistrationController {

    private final RegistrationFormService formService;
    private final RegistrationResponseService responseService;
    private final com.campusarena.eventhub.user.service.SecurityService securityService;

    /**
     * Create a new registration form
     * Image should be uploaded to Cloudinary first, then imageUrl and imagePublicId sent in the request body
     */
    @PostMapping("/forms")
    public ResponseEntity<RegistrationForm> createForm(
            @RequestBody RegistrationForm form,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(formService.createForm(form, securityService.getCurrentUser(auth)));
    }

    /**
     * Update an existing registration form
     * Image should be uploaded to Cloudinary first, then imageUrl and imagePublicId sent in the request body
     */
    @PutMapping("/forms/{id}")
    public ResponseEntity<RegistrationForm> updateForm(
            @PathVariable String id,
            @RequestBody RegistrationForm form,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(formService.updateForm(id, form, securityService.getCurrentUser(auth)));
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
