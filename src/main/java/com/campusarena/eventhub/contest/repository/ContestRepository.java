package com.campusarena.eventhub.contest.repository;

import com.campusarena.eventhub.contest.model.Contest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContestRepository extends MongoRepository<Contest, String> {
}
