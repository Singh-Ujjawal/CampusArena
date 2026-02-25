package com.campusarena.eventhub.leetcode.controller;

import com.campusarena.eventhub.leetcode.dto.LcQuestionRequest;
import com.campusarena.eventhub.leetcode.model.LcQuestion;
import com.campusarena.eventhub.leetcode.service.LcQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/leetcode/questions")
@RequiredArgsConstructor
public class LcAdminController {

    private final LcQuestionService lcQuestionService;

    @PostMapping
    public LcQuestion createQuestion(@Valid @RequestBody LcQuestionRequest request) {
        return lcQuestionService.createQuestion(request);
    }

    @GetMapping
    public List<LcQuestion> getAllQuestions() {
        return lcQuestionService.getAllQuestions();
    }

    @GetMapping("/{id}")
    public LcQuestion getQuestion(@PathVariable String id) {
        return lcQuestionService.getQuestionById(id);
    }

    @PutMapping("/{id}")
    public LcQuestion updateQuestion(@PathVariable String id, @Valid @RequestBody LcQuestionRequest request) {
        return lcQuestionService.updateQuestion(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteQuestion(@PathVariable String id) {
        lcQuestionService.deleteQuestion(id);
        return "Question deleted successfully";
    }
}
