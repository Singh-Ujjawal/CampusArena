package com.campusarena.eventhub.registration.service;

import com.campusarena.eventhub.registration.model.RegistrationForm;
import com.campusarena.eventhub.registration.repository.RegistrationFormRepository;
import com.campusarena.eventhub.registration.repository.RegistrationResponseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import com.campusarena.eventhub.user.model.User;
import com.campusarena.eventhub.user.model.Roles;
import com.campusarena.eventhub.exception.ApiException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegistrationFormService {

    private final RegistrationFormRepository formRepository;
    private final RegistrationResponseRepository responseRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public RegistrationForm createForm(RegistrationForm form, MultipartFile image, User creator) throws IOException {
        if (image != null && !image.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);
            Files.createDirectories(filePath.getParent());
            Files.copy(image.getInputStream(), filePath);
            form.setPaymentQrUrl("/files/" + fileName);
        }
        form.setCreatedAt(Instant.now());
        form.setActive(true);
        if (form.getPaymentRequired() == null || !form.getPaymentRequired()) {
            form.setPaymentFees(null);
        }
        if (creator != null) {
            form.setCreatedBy(creator.getUsername());
        }
        return formRepository.save(form);
    }

    public RegistrationForm getForm(String id) {
        return formRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration form not found"));
    }

    public List<RegistrationForm> getAllForms(User currentUser) {
        List<RegistrationForm> allForms = formRepository.findAllByOrderByCreatedAtDesc();
        if (currentUser != null && currentUser.getRole() == Roles.FACULTY) {
            return allForms.stream()
                    .filter(f -> currentUser.getUsername().equals(f.getCreatedBy()))
                    .collect(Collectors.toList());
        }
        return allForms;
    }

    public RegistrationForm updateForm(String id, RegistrationForm updatedForm, MultipartFile image, User currentUser) throws IOException {
        RegistrationForm existing = formRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration form not found"));
        
        if (currentUser != null && currentUser.getRole() == Roles.FACULTY) {
            if (!currentUser.getUsername().equals(existing.getCreatedBy())) {
                throw new ApiException("Access Denied: You can only update forms you created.");
            }
        }
        existing.setTitle(updatedForm.getTitle());
        existing.setDescription(updatedForm.getDescription());
        existing.setQuestions(updatedForm.getQuestions());
        existing.setStartTime(updatedForm.getStartTime());
        existing.setEndTime(updatedForm.getEndTime());
        existing.setActive(updatedForm.isActive());
        existing.setPaymentRequired(updatedForm.getPaymentRequired());
        existing.setPaymentFees(updatedForm.getPaymentFees());
        existing.setClubId(updatedForm.getClubId());
        existing.setEventId(updatedForm.getEventId());
        existing.setContestId(updatedForm.getContestId());
        
        if (existing.getPaymentRequired() == null || !existing.getPaymentRequired()) {
            existing.setPaymentFees(null);
        }
        
        if (image != null && !image.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);
            Files.createDirectories(filePath.getParent());
            Files.copy(image.getInputStream(), filePath);
            existing.setPaymentQrUrl("/files/" + fileName);
        }
        return formRepository.save(existing);
    }

    public void deleteForm(String id, User currentUser) {
        RegistrationForm form = formRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration form not found"));
        
        if (currentUser != null && currentUser.getRole() == Roles.FACULTY) {
            if (!currentUser.getUsername().equals(form.getCreatedBy())) {
                throw new ApiException("Access Denied: You can only delete forms you created.");
            }
        }
        
        formRepository.delete(form);
    }

    public RegistrationForm getFormByEventId(String eventId) {
        return formRepository.findByEventId(eventId)
                .orElseThrow(() -> new RuntimeException("Form not found for event"));
    }

    public RegistrationForm getFormByContestId(String contestId) {
        return formRepository.findByContestId(contestId)
                .orElseThrow(() -> new RuntimeException("Form not found for contest"));
    }
}
