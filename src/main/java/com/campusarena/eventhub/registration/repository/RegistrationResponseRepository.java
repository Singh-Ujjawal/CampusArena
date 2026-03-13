package com.campusarena.eventhub.registration.repository;

import com.campusarena.eventhub.registration.model.RegistrationResponse;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationResponseRepository extends MongoRepository<RegistrationResponse, String> {
    List<RegistrationResponse> findByFormId(String formId);

    List<RegistrationResponse> findByUserId(String userId);

    Optional<RegistrationResponse> findByFormIdAndUserId(String formId, String userId);

    boolean existsByFormIdAndUserId(String formId, String userId);

    long countByFormId(String formId);
}
