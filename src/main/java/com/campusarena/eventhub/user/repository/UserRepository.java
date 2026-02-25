package com.campusarena.eventhub.user.repository;

import com.campusarena.eventhub.user.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByRollNumber(String rollNumber);
    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByLeetCodeUsername(String leetCodeUsername);

    boolean existsByUsernameAndIdNot(String username, String id);
    boolean existsByEmailAndIdNot(String email, String id);
    boolean existsByRollNumberAndIdNot(String rollNumber, String id);
    boolean existsByPhoneNumberAndIdNot(String phoneNumber, String id);
    boolean existsByLeetCodeUsernameAndIdNot(String leetCodeUsername, String id);
}
