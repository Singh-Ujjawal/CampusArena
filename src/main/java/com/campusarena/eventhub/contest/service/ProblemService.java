package com.campusarena.eventhub.contest.service;

import com.campusarena.eventhub.contest.dto.ProblemRequest;
import com.campusarena.eventhub.contest.dto.ProblemResponse;
import com.campusarena.eventhub.contest.model.Problem;
import com.campusarena.eventhub.contest.repository.ProblemRepository;
import com.campusarena.eventhub.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.campusarena.eventhub.user.model.User;
import com.campusarena.eventhub.user.model.Roles;
import com.campusarena.eventhub.exception.ApiException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProblemService {
    private final ProblemRepository repository;

    public ProblemResponse insertProblem(ProblemRequest request, User creator) {
        Problem problem = Problem.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .difficulty(request.getDifficulty())
                .testCases(request.getTestCases())
                .createdBy(creator != null ? creator.getUsername() : null)
                .build();
        return mapToResponse(repository.save(problem));
    }

    public List<ProblemResponse> getAllProblems(User currentUser) {
        List<Problem> allProblems = repository.findAll();
        if (currentUser != null && currentUser.getRole() == Roles.FACULTY) {
            return allProblems.stream()
                    .filter(p -> currentUser.getUsername().equals(p.getCreatedBy()))
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        return allProblems.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProblemResponse getProblemById(String id) {
        Problem problem = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + id));
        return mapToResponse(problem);
    }

    public void deleteProblemById(String id, User currentUser) {
        Problem problem = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + id));
        
        if (currentUser != null && currentUser.getRole() == Roles.FACULTY) {
            if (!currentUser.getUsername().equals(problem.getCreatedBy())) {
                throw new ApiException("Access Denied: You can only delete problems you created.");
            }
        }
        repository.deleteById(id);
    }

    public ProblemResponse updateProblem(ProblemRequest request, String id, User currentUser) {
        Problem problem = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + id));

        if (currentUser != null && currentUser.getRole() == Roles.FACULTY) {
            if (!currentUser.getUsername().equals(problem.getCreatedBy())) {
                throw new ApiException("Access Denied: You can only update problems you created.");
            }
        }
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
