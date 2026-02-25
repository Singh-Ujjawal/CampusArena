package com.campusarena.eventhub.event.repository;

import com.campusarena.eventhub.event.model.McqSubmission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface McqSubmissionRepository extends MongoRepository<McqSubmission, String> {
    Optional<McqSubmission> findByEventIdAndUserId(String eventId, String userId);
    List<McqSubmission> findByUserId(String userId);
    List<McqSubmission> findByEventId(String eventId);
    Optional<McqSubmission> findTopByUserIdAndEventIdOrderByStartTimeDesc(String userId, String eventId);
    List<McqSubmission> findByEventIdOrderByTotalScoreDescSubmittedAtAsc(String eventId);
}

