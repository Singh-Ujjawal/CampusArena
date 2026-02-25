package com.campusarena.eventhub.contest.service;

import com.campusarena.eventhub.contest.dto.ContestRequest;
import com.campusarena.eventhub.contest.dto.ContestResponse;
import com.campusarena.eventhub.contest.model.Contest;
import com.campusarena.eventhub.contest.repository.ContestRepository;
import com.campusarena.eventhub.exception.ApiException;
import com.campusarena.eventhub.exception.ResourceNotFoundException;
import com.campusarena.eventhub.registration.model.RegistrationForm;
import com.campusarena.eventhub.registration.repository.RegistrationFormRepository;
import com.campusarena.eventhub.registration.repository.RegistrationResponseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContestService {

    private final ContestRepository contestRepository;
    private final RegistrationFormRepository registrationFormRepository;
    private final RegistrationResponseRepository registrationResponseRepository;

    public ContestResponse createContest(ContestRequest request) {
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new ApiException("Start time must be before end time");
        }

        Contest contest = Contest.builder()
                .title(request.getTitle())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .clubId(request.getClubId())
                .accessPassword(request.getAccessPassword())
                .problemIds(request.getProblemIds())
                .facultyCoordinators(request.getFacultyCoordinators())
                .studentCoordinators(request.getStudentCoordinators())
                .registrationRequired(
                        request.getRegistrationRequired() != null ? request.getRegistrationRequired() : true)
                .build();

        Contest savedContest = contestRepository.save(contest);
        return mapToResponse(savedContest);
    }

    public List<ContestResponse> getAllContests() {
        return contestRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ContestResponse getContestById(String id) {
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contest not found with id: " + id));
        return mapToResponse(contest);
    }

    public String getContestStatus(Instant startTime, Instant endTime) {
        Instant now = Instant.now();
        if (now.isBefore(startTime))
            return "UPCOMING";
        if (now.isAfter(endTime))
            return "ENDED";
        return "LIVE";
    }

    public void deleteContest(String id) {
        if (!contestRepository.existsById(id)) {
            throw new ResourceNotFoundException("Contest not found with id: " + id);
        }
        contestRepository.deleteById(id);
    }

    public ContestResponse updateContest(ContestRequest request, String id) {
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contest not found with id: " + id));

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new ApiException("Start time must be before end time");
        }

        contest.setTitle(request.getTitle());
        contest.setStartTime(request.getStartTime());
        contest.setEndTime(request.getEndTime());
        contest.setClubId(request.getClubId());
        contest.setAccessPassword(request.getAccessPassword());
        contest.setProblemIds(request.getProblemIds());
        contest.setFacultyCoordinators(request.getFacultyCoordinators());
        contest.setStudentCoordinators(request.getStudentCoordinators());
        contest.setRegistrationRequired(
                request.getRegistrationRequired() != null ? request.getRegistrationRequired() : true);

        return mapToResponse(contestRepository.save(contest));
    }

    public boolean validatePassword(String id, String password, String userId) {
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contest not found"));

        // Always check password first
        if (contest.getAccessPassword() == null || !contest.getAccessPassword().equals(password)) {
            return false;
        }

        if (contest.getRegistrationRequired() != null && contest.getRegistrationRequired()) {
            java.util.Optional<RegistrationForm> regForm = registrationFormRepository.findByContestId(id);
            if (regForm.isPresent()) {
                java.util.Optional<com.campusarena.eventhub.registration.model.RegistrationResponse> regResponse = registrationResponseRepository
                        .findByFormIdAndUserId(regForm.get().getId(), userId);

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

        return true;
    }

    private ContestResponse mapToResponse(Contest contest) {
        return ContestResponse.builder()
                .id(contest.getId())
                .title(contest.getTitle())
                .startTime(contest.getStartTime())
                .endTime(contest.getEndTime())
                .clubId(contest.getClubId())
                .accessPassword(contest.getAccessPassword())
                .problemIds(contest.getProblemIds())
                .facultyCoordinators(contest.getFacultyCoordinators())
                .studentCoordinators(contest.getStudentCoordinators())
                .status(getContestStatus(contest.getStartTime(), contest.getEndTime()))
                .registrationRequired(contest.getRegistrationRequired())
                .build();
    }
}
