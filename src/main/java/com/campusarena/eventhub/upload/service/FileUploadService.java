package com.campusarena.eventhub.upload.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@Slf4j
public class FileUploadService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public String uploadFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        try {
            // Create upload directory using NIO for cross-platform compatibility
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            Files.createDirectories(uploadPath);
            log.info("Upload directory: {}", uploadPath);

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf('.')) : ".png";
            String uniqueFilename = UUID.randomUUID() + fileExtension;

            // Save file to disk using NIO
            Path destinationPath = uploadPath.resolve(uniqueFilename);
            Files.write(destinationPath, file.getBytes());
            log.info("File saved successfully: {}", destinationPath);

            // Return file path that can be served via HTTP
            return "/uploads/" + uniqueFilename;
        } catch (IOException e) {
            log.error("Error uploading file: ", e);
            throw new IOException("Failed to upload file: " + e.getMessage(), e);
        }
    }
}
