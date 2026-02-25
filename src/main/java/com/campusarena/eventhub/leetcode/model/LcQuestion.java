package com.campusarena.eventhub.leetcode.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * A LeetCode problem tracked by the admin for the college.
 * Using separate collection 'lc_questions' to avoid collision with contest questions.
 */
@Document(collection = "lc_questions")
@Data
public class LcQuestion {
    @Id
    private String id;
    private String title;
    @Indexed(unique = true)
    private String slug;
    private String url;
    private String difficulty; // Easy, Medium, Hard
    private String topic;      // Arrays, DP, Graph, etc.
}
