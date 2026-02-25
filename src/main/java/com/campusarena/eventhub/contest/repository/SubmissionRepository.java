package com.campusarena.eventhub.contest.repository;

import com.campusarena.eventhub.contest.dto.SubmissionResponse;
import com.campusarena.eventhub.contest.model.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, String> {
    List<Submission> findByContestId(String contestId);
    List<Submission> findByContestIdAndUserId(String contestId, String userId);
    List<Submission> findByProblemIdAndUserId(String problemId, String userId);
    List<Submission> findByProblemId(String problemId);
    boolean existsByUserIdAndProblemIdAndContestIdAndVerdict(String userId, String problemId, String contestId, String verdict);

    List<Submission> findByUserId(String userId);
}

