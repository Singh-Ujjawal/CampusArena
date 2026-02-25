package com.campusarena.eventhub.leetcode.service;

import com.campusarena.eventhub.leetcode.dto.LcQuestionRequest;
import com.campusarena.eventhub.leetcode.model.LcQuestion;
import com.campusarena.eventhub.leetcode.repository.LcQuestionRepository;
import com.campusarena.eventhub.leetcode.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LcQuestionService {
    private final LcQuestionRepository lcQuestionRepository;

    public LcQuestion createQuestion(LcQuestionRequest request) {
        String slug = SlugUtil.extractSlug(request.getUrl());
        if (lcQuestionRepository.existsBySlug(slug)) {
            throw new RuntimeException("Question already exists");
        }
        LcQuestion question = new LcQuestion();
        question.setTitle(request.getTitle());
        question.setUrl(request.getUrl());
        question.setSlug(slug);
        question.setDifficulty(request.getDifficulty());
        question.setTopic(request.getTopic());
        return lcQuestionRepository.save(question);
    }

    public List<LcQuestion> getAllQuestions() {
        return lcQuestionRepository.findAll();
    }

    public LcQuestion getQuestionById(String id) {
        return lcQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
    }

    public LcQuestion updateQuestion(String id, LcQuestionRequest request) {
        LcQuestion question = getQuestionById(id);
        question.setTitle(request.getTitle());
        question.setUrl(request.getUrl());
        question.setSlug(SlugUtil.extractSlug(request.getUrl()));
        question.setDifficulty(request.getDifficulty());
        question.setTopic(request.getTopic());
        return lcQuestionRepository.save(question);
    }

    public void deleteQuestion(String id) {
        lcQuestionRepository.deleteById(id);
    }
}
