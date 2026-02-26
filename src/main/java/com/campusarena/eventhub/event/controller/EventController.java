package com.campusarena.eventhub.event.controller;

import com.campusarena.eventhub.event.dto.*;
import com.campusarena.eventhub.event.model.Event;
import com.campusarena.eventhub.event.repository.EventRepository;
import com.campusarena.eventhub.event.service.EventRegistrationService;
import com.campusarena.eventhub.event.service.EventService;
import com.campusarena.eventhub.event.service.PdfExportService;
import com.campusarena.eventhub.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventRepository eventRepository;
    private final EventService eventService;
    private final EventRegistrationService registrationService;
    private final PdfExportService pdfExportService;
    private final com.campusarena.eventhub.user.service.SecurityService securityService;


    @PostMapping
    public ResponseEntity<Event> createEvent(@Valid @RequestBody Event event, @RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(eventService.createEvent(event, securityService.getCurrentUser(auth)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable String id, @Valid @RequestBody Event event, @RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(eventService.updateEvent(id, event, securityService.getCurrentUser(auth)));
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents(@RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(eventService.getAllEvents(securityService.getCurrentUser(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable String id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String auth) {
        com.campusarena.eventhub.user.model.User user = securityService.getCurrentUser(auth);
        Event event = eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        
        if (user != null && user.getRole() == com.campusarena.eventhub.user.model.Roles.FACULTY) {
            if (!user.getUsername().equals(event.getCreatedBy())) {
                throw new com.campusarena.eventhub.exception.ApiException("Access Denied: You can only delete events you created.");
            }
        }
        
        eventRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // MCQ Endpoints
    @PostMapping("/{id}/start")
    public ResponseEntity<List<QuestionResponseDTO>> startTest(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestParam(required = false) String accessPassword) {
        return ResponseEntity.ok(eventService.startTest(userId, id, accessPassword));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<McqResultDTO> submitTest(@PathVariable String id, @RequestParam String userId, @RequestBody SubmitMcqRequestDTO request) {
        return ResponseEntity.ok(eventService.submitTest(userId, id, request));
    }

    @GetMapping("/{id}/result")
    public ResponseEntity<McqResultDTO> getTestResult(@PathVariable String id, @RequestParam String userId) {
        return ResponseEntity.ok(eventService.getTestResult(userId, id));
    }

    @GetMapping("/{id}/remaining-time")
    public ResponseEntity<RemainingTimeResponseDTO> getRemainingTime(@PathVariable String id, @RequestParam String userId) {
        return ResponseEntity.ok(eventService.getRemainingTime(userId, id));
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<AdminEventAnalyticsDTO> getAnalytics(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(eventService.getEventAnalytics(id, securityService.getCurrentUser(auth)));
    }

    @GetMapping("/{id}/analytics/pdf")
    public ResponseEntity<byte[]> getAnalyticsPdf(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String auth) {
        com.campusarena.eventhub.user.model.User user = securityService.getCurrentUser(auth);
        Event event = eventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        AdminEventAnalyticsDTO analytics = eventService.getEventAnalytics(id, user);
        java.io.ByteArrayInputStream bis = pdfExportService.generateAnalyticsPdf(analytics, event.getTitle());

        return ResponseEntity.ok()

                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=analytics.pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(bis.readAllBytes());
    }

    // Registration Endpoints

    @PostMapping("/{id}/register")
    public ResponseEntity<String> register(@PathVariable String id, @RequestParam String userId) {
        return ResponseEntity.ok(registrationService.register(userId, id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<String> cancelRegistration(@PathVariable String id, @RequestParam String userId) {
        return ResponseEntity.ok(registrationService.cancelRegistration(userId, id));
    }
}
