package com.campusarena.eventhub.event.service;

import com.campusarena.eventhub.event.model.Event;
import com.campusarena.eventhub.event.model.EventRegistration;
import com.campusarena.eventhub.event.repository.EventRegistrationRepository;
import com.campusarena.eventhub.event.repository.EventRepository;
import com.campusarena.eventhub.exception.ApiException;
import com.campusarena.eventhub.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class EventRegistrationService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;

    public String register(String userId, String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (event.getStartTime() == null) {
            throw new ApiException("Event start time not configured");
        }

        Instant now = Instant.now();

        if (registrationRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new ApiException("Already registered for this event");
        }

        EventRegistration registration = new EventRegistration();
        registration.setEventId(eventId);
        registration.setUserId(userId);
        registration.setRegisteredAt(now);
        registration.setStatus("REGISTERED");

        registrationRepository.save(registration);
        return "Successfully registered for event";
    }

    public String cancelRegistration(String userId, String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (!Instant.now().isBefore(event.getStartTime())) {
            throw new ApiException("Cannot cancel. Event already started.");
        }

        EventRegistration registration = registrationRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new ApiException("Registration not found"));

        if ("CANCELLED".equals(registration.getStatus())) {
            throw new ApiException("Registration already cancelled");
        }

        registration.setStatus("CANCELLED");
        registrationRepository.save(registration);
        return "Registration cancelled successfully";
    }

    public long getTotalRegistrations(String eventId) {
        return registrationRepository.countByEventId(eventId);
    }
}
