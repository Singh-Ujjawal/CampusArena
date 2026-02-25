package com.campusarena.eventhub.upload.controller;

import com.campusarena.eventhub.upload.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;

@RequestMapping("/api/upload")
@RestController
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {

    private final FileUploadService fileUploadService;

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        log.info("Upload request received. File: {}, Size: {}", file.getOriginalFilename(), file.getSize());
        
        try {
            String filePath = fileUploadService.uploadFile(file);
            Map<String, String> response = new HashMap<>();
            response.put("path", filePath);
            log.info("File uploaded successfully: {}", filePath);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            log.warn("Validation error: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("File upload error: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "File upload failed: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

