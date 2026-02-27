package com.campusarena.eventhub.upload.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import java.util.Base64;

@Service
@Slf4j
public class CloudinaryService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Delete an image from Cloudinary using its public_id
     * Uses Cloudinary's REST API with basic auth
     * @param publicId The Cloudinary public_id of the image to delete
     */
    public void deleteImage(String publicId) {
        if (publicId == null || publicId.isEmpty()) {
            log.warn("Attempted to delete image with null or empty publicId");
            return;
        }

        try {
            // Cloudinary API endpoint for deletion
            String url = String.format("https://api.cloudinary.com/v1_1/%s/image/destroy", cloudName);

            // Create request body
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("public_id", publicId);
            body.add("api_key", apiKey);
            body.add("api_secret", apiSecret);

            // Create headers for form-urlencoded
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            // Create request entity
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            // Call Cloudinary API
            restTemplate.postForObject(url, request, String.class);
            log.info("Successfully deleted image from Cloudinary: {}", publicId);
        } catch (Exception e) {
            log.error("Failed to delete image from Cloudinary with publicId: {}", publicId, e);
            // Don't throw exception - image deletion failure shouldn't block form deletion
        }
    }
}
