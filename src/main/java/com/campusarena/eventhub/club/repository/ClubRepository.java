package com.campusarena.eventhub.club.repository;

import com.campusarena.eventhub.club.model.Club;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClubRepository extends MongoRepository<Club, String> {
}
