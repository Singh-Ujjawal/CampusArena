package com.campusarena.eventhub.event.repository;

import com.campusarena.eventhub.event.model.McqQuestion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface McqQuestionRepository extends MongoRepository<McqQuestion, String> {
    List<McqQuestion> findByEventId(String eventId);
}
