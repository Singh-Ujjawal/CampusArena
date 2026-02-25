package com.campusarena.eventhub.contest.service;

import com.campusarena.eventhub.contest.dto.ProblemRequest;
import com.campusarena.eventhub.contest.dto.ProblemResponse;
import com.campusarena.eventhub.contest.model.Problem;
import com.campusarena.eventhub.contest.repository.ProblemRepository;
import com.campusarena.eventhub.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProblemService {
    private final ProblemRepository repository;

    public ProblemResponse insertProblem(ProblemRequest request) {
        Problem problem = Problem.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .difficulty(request.getDifficulty())
                .testCases(request.getTestCases())
                .build();
        return mapToResponse(repository.save(problem));
    }

    public List<ProblemResponse> getAllProblems() {
        return repository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProblemResponse getProblemById(String id) {
        Problem problem = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + id));
        return mapToResponse(problem);
    }

    public void deleteProblemById(String id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Problem not found with id: " + id);
        }
        repository.deleteById(id);
    }

    public ProblemResponse updateProblem(ProblemRequest request, String id) {
        Problem problem = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + id));
        problem.setTitle(request.getTitle());
        problem.setDescription(request.getDescription());
        problem.setDifficulty(request.getDifficulty());
        problem.setTestCases(request.getTestCases());
        return mapToResponse(repository.save(problem));
    }

    private ProblemResponse mapToResponse(Problem problem) {
        return ProblemResponse.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .description(problem.getDescription())
                .difficulty(problem.getDifficulty())
                .testCases(problem.getTestCases())
                .build();
    }
}
