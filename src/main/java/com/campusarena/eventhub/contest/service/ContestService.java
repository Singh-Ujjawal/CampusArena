package com.campusarena.eventhub.contest.service;

import com.campusarena.eventhub.contest.dto.ContestRequest;
import com.campusarena.eventhub.contest.dto.ContestResponse;
import com.campusarena.eventhub.contest.model.Contest;
import com.campusarena.eventhub.contest.repository.ContestRepository;
import com.campusarena.eventhub.exception.ApiException;
import com.campusarena.eventhub.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContestService {

    private final ContestRepository contestRepository;

    public ContestResponse createContest(ContestRequest request) {
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new ApiException("Start time must be before end time");
        }

        Contest contest = Contest.builder()
                .title(request.getTitle())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .clubId(request.getClubId())
                .problemIds(request.getProblemIds())
                .facultyCoordinators(request.getFacultyCoordinators())
                .studentCoordinators(request.getStudentCoordinators())
                .build();

        return mapToResponse(contestRepository.save(contest));
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
        if (now.isBefore(startTime)) return "UPCOMING";
        if (now.isAfter(endTime)) return "ENDED";
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
        contest.setProblemIds(request.getProblemIds());
        contest.setFacultyCoordinators(request.getFacultyCoordinators());
        contest.setStudentCoordinators(request.getStudentCoordinators());

        return mapToResponse(contestRepository.save(contest));
    }

    private ContestResponse mapToResponse(Contest contest) {
        return ContestResponse.builder()
                .id(contest.getId())
                .title(contest.getTitle())
                .startTime(contest.getStartTime())
                .endTime(contest.getEndTime())
                .clubId(contest.getClubId())
                .problemIds(contest.getProblemIds())
                .facultyCoordinators(contest.getFacultyCoordinators())
                .studentCoordinators(contest.getStudentCoordinators())
                .status(getContestStatus(contest.getStartTime(), contest.getEndTime()))
                .build();
    }
}
