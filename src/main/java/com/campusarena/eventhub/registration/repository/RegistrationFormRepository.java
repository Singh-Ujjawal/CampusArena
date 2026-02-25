package com.campusarena.eventhub.registration.repository;

import com.campusarena.eventhub.registration.model.RegistrationForm;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationFormRepository extends MongoRepository<RegistrationForm, String> {
    List<RegistrationForm> findByClubId(String clubId);
    Optional<RegistrationForm> findByEventId(String eventId);
    Optional<RegistrationForm> findByContestId(String contestId);
    List<RegistrationForm> findAllByOrderByCreatedAtDesc();
}
