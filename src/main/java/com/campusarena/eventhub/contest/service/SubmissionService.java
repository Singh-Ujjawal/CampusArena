package com.campusarena.eventhub.contest.service;

import com.campusarena.eventhub.contest.dto.RunRequest;
import com.campusarena.eventhub.contest.dto.RunResponse;
import com.campusarena.eventhub.contest.dto.SubmissionRequest;
import com.campusarena.eventhub.contest.dto.SubmissionResponse;
import com.campusarena.eventhub.contest.model.Contest;
import com.campusarena.eventhub.contest.model.Problem;
import com.campusarena.eventhub.contest.model.Submission;
import com.campusarena.eventhub.contest.repository.ContestRepository;
import com.campusarena.eventhub.contest.repository.ProblemRepository;
import com.campusarena.eventhub.contest.repository.SubmissionRepository;
import com.campusarena.eventhub.registration.model.RegistrationForm;
import com.campusarena.eventhub.registration.repository.RegistrationFormRepository;
import com.campusarena.eventhub.registration.repository.RegistrationResponseRepository;
import com.campusarena.eventhub.execution.dto.ExecutionRequest;
import com.campusarena.eventhub.execution.dto.ExecutionResponse;
import com.campusarena.eventhub.execution.dto.ExecutionTestCase;
import com.campusarena.eventhub.execution.model.Language;
import com.campusarena.eventhub.execution.service.CodeExecutionService;
import com.campusarena.eventhub.execution.service.RateLimitService;
import com.campusarena.eventhub.exception.ApiException;
import com.campusarena.eventhub.exception.ResourceNotFoundException;
import com.campusarena.eventhub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final ContestRepository contestRepository;
    private final UserRepository userRepository;
    private final CodeExecutionService codeExecutionService;
    private final RateLimitService rateLimitService;
    private final RegistrationFormRepository registrationFormRepository;
    private final RegistrationResponseRepository registrationResponseRepository;

    public SubmissionResponse submitCode(SubmissionRequest request) {
        rateLimitService.checkRateLimit(request.getUserId(), request.getProblemId());

        Contest contest = contestRepository.findById(request.getContestId())
                .orElseThrow(() -> new ResourceNotFoundException("Contest not found"));

        Instant now = Instant.now();
        if (now.isBefore(contest.getStartTime())) throw new ApiException("Contest has not started yet");
        if (now.isAfter(contest.getEndTime())) throw new ApiException("Contest has ended");

        // Check registration
        if (contest.getRegistrationRequired() != null && contest.getRegistrationRequired()) {
            java.util.Optional<RegistrationForm> regForm = registrationFormRepository.findByContestId(request.getContestId());
            if (regForm.isPresent()) {
                java.util.Optional<com.campusarena.eventhub.registration.model.RegistrationResponse> regResponse = registrationResponseRepository
                        .findByFormIdAndUserId(regForm.get().getId(), request.getUserId());

                if (regResponse.isEmpty()) {
                    throw new ApiException("You must register for this contest before participating.");
                }

                if (!"APPROVED".equals(regResponse.get().getStatus())) {
                    String status = regResponse.get().getStatus();
                    throw new ApiException("Your registration status is " + status
                            + ". You can only participate once it is APPROVED by an admin.");
                }
            } else {
                throw new ApiException(
                        "Registration is required for this contest, but the registration form is not yet available.");
            }
        }

        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (submissionRepository.existsByUserIdAndProblemIdAndContestIdAndVerdict(
                request.getUserId(), request.getProblemId(), request.getContestId(), "ACCEPTED")) {
            throw new ApiException("Problem already solved!");
        }

        Submission submission = Submission.builder()
                .userId(request.getUserId())
                .contestId(request.getContestId())
                .problemId(request.getProblemId())
                .code(request.getCode())
                .language(request.getLanguage())
                .verdict("PENDING")
                .score(0)
                .submittedAt(now)
                .build();

        submission = submissionRepository.save(submission);

        List<ExecutionTestCase> testCases = problem.getTestCases().stream()
                .map(tc -> new ExecutionTestCase(tc.getInput(), tc.getExpectedOutput()))
                .collect(Collectors.toList());

        if (testCases.isEmpty()) {
            submission.setVerdict("WRONG_ANSWER");
            submission.setStderr("No test cases.");
            return mapToResponse(submissionRepository.save(submission));
        }

        ExecutionRequest execRequest = new ExecutionRequest();
        execRequest.setSourceCode(request.getCode());
        execRequest.setLanguage(mapLanguage(request.getLanguage()));
        execRequest.setTimeLimit(2);
        execRequest.setTestCases(testCases);

        ExecutionResponse res = codeExecutionService.executeCode(execRequest);

        int passed = res.getPassedTestCases() != null ? res.getPassedTestCases() : 0;
        int total = res.getTotalTestCases() != null ? res.getTotalTestCases() : testCases.size();
        
        // No partial marking: only 100 if all pass, else 0
        int score = (total > 0 && passed == total) ? 100 : 0;

        submission.setScore(score);
        
        // If not all passed, the verdict should be WRONG_ANSWER (or whatever non-ACCEPTED status it has)
        String finalVerdict = res.getStatus().name();
        if (passed < total && "ACCEPTED".equals(finalVerdict)) {
            finalVerdict = "WRONG_ANSWER";
        }
        
        submission.setVerdict(finalVerdict);
        submission.setExecutionTime(res.getExecutionTime());
        submission.setPassedTestCases(passed);
        submission.setTotalTestCases(total);
        submission.setFailedTestCase(res.getFailedTestCase());
        submission.setCompileError(res.getCompileError());
        submission.setStderr(res.getStderr());

        return mapToResponse(submissionRepository.save(submission));
    }

    public RunResponse runSampleTests(RunRequest request) {
        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        List<ExecutionTestCase> sampleCases = problem.getTestCases().stream()
                .filter(tc -> !tc.isHidden())
                .map(tc -> new ExecutionTestCase(tc.getInput(), tc.getExpectedOutput()))
                .toList();

        if (sampleCases.isEmpty()) {
            return RunResponse.builder().verdict("NO_SAMPLE_TESTS").stderr("No visible test cases.").build();
        }

        ExecutionRequest execRequest = new ExecutionRequest();
        execRequest.setSourceCode(request.getCode());
        execRequest.setLanguage(mapLanguage(request.getLanguage()));
        execRequest.setTimeLimit(5);
        execRequest.setTestCases(sampleCases);

        ExecutionResponse res = codeExecutionService.executeCode(execRequest);

        return RunResponse.builder()
                .verdict(res.getStatus().name())
                .executionTime(res.getExecutionTime())
                .passedTestCases(res.getPassedTestCases())
                .totalTestCases(res.getTotalTestCases())
                .failedTestCase(res.getFailedTestCase())
                .compileError(res.getCompileError())
                .stderr(res.getStderr())
                .stdout(res.getStdout())
                .build();
    }

    public List<SubmissionResponse> getSubmissionsByContest(String contestId) {
        return submissionRepository.findByContestId(contestId).stream().map(this::mapToResponse).toList();
    }

    public List<SubmissionResponse> getSubmissionsByUser(String userId) {
        return submissionRepository.findByUserId(userId).stream().map(this::mapToResponse).toList();
    }

    public List<SubmissionResponse> getSubmissionsByContestAndUser(String contestId, String userId) {
        return submissionRepository.findByContestIdAndUserId(contestId, userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<SubmissionResponse> getAllSubmissions() {
        return submissionRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    private SubmissionResponse mapToResponse(Submission s) {
        return SubmissionResponse.builder()
                .id(s.getId())
                .userId(s.getUserId())
                .contestId(s.getContestId())
                .problemId(s.getProblemId())
                .code(s.getCode())
                .language(s.getLanguage())
                .verdict(s.getVerdict())
                .score(s.getScore())
                .submittedAt(s.getSubmittedAt())
                .executionTime(s.getExecutionTime())
                .passedTestCases(s.getPassedTestCases())
                .totalTestCases(s.getTotalTestCases())
                .failedTestCase(s.getFailedTestCase())
                .compileError(s.getCompileError())
                .stderr(s.getStderr())
                .build();
    }

    private Language mapLanguage(String lang) {
        try {
            return Language.valueOf(lang.toUpperCase());
        } catch (Exception e) {
            throw new ApiException("Unsupported language: " + lang);
        }
    }
}
