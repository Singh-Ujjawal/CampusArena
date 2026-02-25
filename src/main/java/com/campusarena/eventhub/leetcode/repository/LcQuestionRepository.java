package com.campusarena.eventhub.leetcode.repository;

import com.campusarena.eventhub.leetcode.model.LcQuestion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LcQuestionRepository extends MongoRepository<LcQuestion, String> {
    boolean existsBySlug(String slug);
    Optional<LcQuestion> findBySlug(String slug);
}
