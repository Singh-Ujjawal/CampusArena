package com.campusarena.eventhub.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@Slf4j
public class FileConfig {
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            Files.createDirectories(uploadPath);
            log.info("Upload directory initialized at: {}", uploadPath);
        } catch (IOException e) {
            log.error("Error initializing upload directory: ", e);
        }
    }
}

