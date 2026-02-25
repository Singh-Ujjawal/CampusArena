package com.campusarena.eventhub.contest.model;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TestCase {
    private String input;
    private String expectedOutput;
    private boolean hidden;
}
