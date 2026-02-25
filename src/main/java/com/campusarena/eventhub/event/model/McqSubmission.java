package com.campusarena.eventhub.event.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "mcq_submissions")
@CompoundIndexes({
        @CompoundIndex(name = "event_user_idx", def = "{'eventId':1, 'userId':1}", unique = true)
})
public class McqSubmission {
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    @Indexed
    private String eventId;
    
    private Instant startTime;
    private Instant submittedAt;
    private String status; // IN_PROGRESS, COMPLETED, AUTO_SUBMITTED
    
    @Indexed
    private Double totalScore;
    
    private Integer correctCount;
    private Integer wrongCount;
    private Integer attemptedCount;
    
    private List<Answer> answers;
}
