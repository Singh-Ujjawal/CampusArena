package com.campusarena.eventhub.leetcode.repository;

import com.campusarena.eventhub.leetcode.model.LcUserQuestion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LcUserQuestionRepository extends MongoRepository<LcUserQuestion, String> {
    boolean existsByCampusUserIdAndQuestionId(String campusUserId, String questionId);
    long countByCampusUserId(String campusUserId);
    List<LcUserQuestion> findByCampusUserId(String campusUserId);
    void deleteByCampusUserId(String campusUserId);
}
