package com.campusarena.eventhub.event.repository;

import com.campusarena.eventhub.event.model.EventRegistration;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends MongoRepository<EventRegistration, String> {
    Optional<EventRegistration> findByEventIdAndUserId(String eventId, String userId);
    List<EventRegistration> findByUserId(String userId);
    List<EventRegistration> findByEventId(String eventId);
    boolean existsByEventIdAndUserId(String eventId, String userId);
    long countByEventId(String eventId);
}

