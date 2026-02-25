package com.campusarena.eventhub.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.File;

@Configuration
public class FileConfig {
    @Value("${file.upload-dir}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        File file = new File(uploadDir);
        if (!file.exists()) {
            file.mkdirs();
        }
    }
}
