package com.campusarena.eventhub.security;

import com.campusarena.eventhub.user.model.User;
import com.campusarena.eventhub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PasswordMigrationRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking for unencrypted passwords...");
        List<User> users = userRepository.findAll();
        long migrationCount = 0;

        for (User user : users) {
            String password = user.getPassword();
            if (password != null && !isBCrypt(password)) {
                log.info("Migrating password for user: {}", user.getUsername());
                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
                migrationCount++;
            }
        }

        if (migrationCount > 0) {
            log.info("Successfully migrated {} passwords to BCrypt.", migrationCount);
        } else {
            log.info("No passwords needed migration.");
        }
    }

    private boolean isBCrypt(String password) {
        // BCrypt hashes start with $2a$, $2b$ or $2y$ and are 60 chars long
        return password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$");
    }
}
