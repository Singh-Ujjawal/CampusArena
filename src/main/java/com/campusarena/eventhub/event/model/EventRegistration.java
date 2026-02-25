package com.campusarena.eventhub.event.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "event_registrations")
@CompoundIndexes({
        @CompoundIndex(name = "event_user_unique_idx",
                def = "{'eventId':1, 'userId':1}",
                unique = true)
})
public class EventRegistration {
    @Id
    private String id;
    private String eventId;
    private String userId; // Reference to User ID
    private Instant registeredAt;
    private String status; // REGISTERED, CANCELLED
}
