package com.campusarena.eventhub.event.controller;

import com.campusarena.eventhub.event.dto.CreateQuestionDTO;
import com.campusarena.eventhub.event.model.McqQuestion;
import com.campusarena.eventhub.event.repository.EventRepository;
import com.campusarena.eventhub.event.repository.McqQuestionRepository;
import com.campusarena.eventhub.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final McqQuestionRepository questionRepository;
    private final EventRepository eventRepository;

    @PostMapping("/{eventId}")
    public ResponseEntity<McqQuestion> addQuestion(@PathVariable String eventId, @Valid @RequestBody CreateQuestionDTO request) {
        if (!eventRepository.existsById(eventId)) throw new ResourceNotFoundException("Event not found");

        McqQuestion question = new McqQuestion();
        question.setEventId(eventId);
        question.setQuestionText(request.getQuestionText());
        question.setOptions(request.getOptions());
        question.setCorrectOption(request.getCorrectOption());
        question.setMarks(request.getMarks());
        question.setNegativeMarks(request.getNegativeMarks() != null ? request.getNegativeMarks() : 0.0);

        return ResponseEntity.ok(questionRepository.save(question));
    }

    @PostMapping("/bulk/{eventId}")
    public ResponseEntity<List<McqQuestion>> addBulkQuestions(@PathVariable String eventId, @Valid @RequestBody List<CreateQuestionDTO> questions) {
        if (!eventRepository.existsById(eventId)) throw new ResourceNotFoundException("Event not found");

        List<McqQuestion> list = questions.stream().map(req -> {
            McqQuestion q = new McqQuestion();
            q.setEventId(eventId);
            q.setQuestionText(req.getQuestionText());
            q.setOptions(req.getOptions());
            q.setCorrectOption(req.getCorrectOption());
            q.setMarks(req.getMarks());
            q.setNegativeMarks(req.getNegativeMarks() != null ? req.getNegativeMarks() : 0.0);
            return q;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(questionRepository.saveAll(list));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<McqQuestion>> getQuestionsByEvent(@PathVariable String eventId) {
        return ResponseEntity.ok(questionRepository.findByEventId(eventId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable String id) {
        if (!questionRepository.existsById(id)) throw new ResourceNotFoundException("Question not found");
        questionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
