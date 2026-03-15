package com.campusarena.eventhub.registration.repository;

import com.campusarena.eventhub.registration.model.FeedbackSubmission;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface FeedbackSubmissionRepository extends MongoRepository<FeedbackSubmission, String> {
    List<FeedbackSubmission> findByFormId(String formId);
    Optional<FeedbackSubmission> findByFormIdAndUserId(String formId, String userId);
    boolean existsByFormIdAndUserId(String formId, String userId);
}
