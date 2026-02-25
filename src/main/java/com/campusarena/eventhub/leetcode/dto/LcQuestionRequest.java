package com.campusarena.eventhub.leetcode.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LcQuestionRequest {
    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "URL is required")
    private String url;
    @NotBlank(message = "Difficulty is required")
    private String difficulty;
    @NotBlank(message = "Topic is required")
    private String topic;
}
