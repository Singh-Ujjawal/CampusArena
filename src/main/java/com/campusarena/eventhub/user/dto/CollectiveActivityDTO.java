package com.campusarena.eventhub.user.dto;

import com.campusarena.eventhub.user.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CollectiveActivityDTO {
    private List<UserWithActivityDTO> users;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserWithActivityDTO {
        private User user;
        private UserActivityDTO activity;
    }
}
