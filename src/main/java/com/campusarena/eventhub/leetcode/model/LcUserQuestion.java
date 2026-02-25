package com.campusarena.eventhub.leetcode.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Tracks which LeetCode questions a registered user (by CampusArena userId) has solved.
 */
@Document(collection = "lc_user_questions")
@Data
@CompoundIndex(def = "{'campusUserId':1, 'questionId':1}", unique = true)
public class LcUserQuestion {
    @Id
    private String id;
    /** CampusArena User.id — not the old lctesting User */
    private String campusUserId;
    private String questionId;   // LcQuestion.id
    private Long solvedAt;       // epoch millis from LeetCode timestamp
}
