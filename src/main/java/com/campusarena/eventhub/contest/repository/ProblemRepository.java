package com.campusarena.eventhub.contest.repository;

import com.campusarena.eventhub.contest.model.Problem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemRepository extends MongoRepository<Problem, String> {
    List<Problem> findAllByIdIn(List<String> ids);
}
