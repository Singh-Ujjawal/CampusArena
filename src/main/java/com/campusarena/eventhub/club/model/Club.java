package com.campusarena.eventhub.club.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "clubs")
public class Club {
    @Id
    private String id;
    
    @NotBlank(message = "Club name is required")
    @Indexed(unique = true)
    private String name;
    
    @NotBlank(message = "Club image URL is required")
    private String image;
    
    @NotBlank(message = "Club coordinator ID is required")
    private String clubCoordinatorId;
}
