package com.campusarena.eventhub.event.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "mcq_questions")
public class McqQuestion {
    @Id
    private String id;
    
    @Indexed
    private String eventId;
    
    private String questionText;
    private List<String> options;
    private Integer correctOption; // Index of correct option (0-3)
    private Double marks;
    private Double negativeMarks;
}
