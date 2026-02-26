package com.campusarena.eventhub.user.service;

import com.campusarena.eventhub.user.model.Roles;
import com.campusarena.eventhub.user.model.User;
import com.campusarena.eventhub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class SecurityService {

    private final UserRepository userRepository;

    public User getCurrentUser(String authHeader) {
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof org.springframework.security.authentication.AnonymousAuthenticationToken) {
            return null;
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    public boolean isAdmin(User user) {
        return user != null && user.getRole() == Roles.ADMIN;
    }

    public boolean isFaculty(User user) {
        return user != null && user.getRole() == Roles.FACULTY;
    }

    public boolean isStaff(User user) {
        return isAdmin(user) || isFaculty(user);
    }
}
