package com.campusarena.eventhub.registration.service;

import com.campusarena.eventhub.registration.model.EvaluationCriterion;
import com.campusarena.eventhub.registration.model.RegistrationForm;
import com.campusarena.eventhub.registration.repository.RegistrationFormRepository;
import com.campusarena.eventhub.registration.repository.RegistrationResponseRepository;
import com.campusarena.eventhub.upload.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.campusarena.eventhub.user.model.User;
import com.campusarena.eventhub.user.model.Roles;
import com.campusarena.eventhub.exception.ApiException;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegistrationFormService {

    private final RegistrationFormRepository formRepository;
    private final CloudinaryService cloudinaryService;

    /**
     * Create a new registration form with Cloudinary image URL
     */
    public RegistrationForm createForm(RegistrationForm form, User creator) {
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

    /**
     * Update an existing registration form
     * If a new image is provided, delete the old image from Cloudinary
     */
    public RegistrationForm updateForm(String id, RegistrationForm updatedForm, User currentUser) {
        RegistrationForm existing = formRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration form not found"));
        
        if (currentUser != null && currentUser.getRole() == Roles.FACULTY) {
            if (!currentUser.getUsername().equals(existing.getCreatedBy())) {
                throw new ApiException("Access Denied: You can only update forms you created.");
            }
        }

        // Delete old image from Cloudinary if a new one is provided
        if (updatedForm.getImageUrl() != null && !updatedForm.getImageUrl().isEmpty() 
                && !updatedForm.getImageUrl().equals(existing.getImageUrl())
                && existing.getImagePublicId() != null) {
            cloudinaryService.deleteImage(existing.getImagePublicId());
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
        existing.setImageUrl(updatedForm.getImageUrl());
        existing.setImagePublicId(updatedForm.getImagePublicId());
        existing.setEvaluationCriteria(updatedForm.getEvaluationCriteria());
        
        if (existing.getPaymentRequired() == null || !existing.getPaymentRequired()) {
            existing.setPaymentFees(null);
        }
        
        return formRepository.save(existing);
    }

    /**
     * Delete a registration form
     * Also deletes the associated image from Cloudinary
     */
    public void deleteForm(String id, User currentUser) {
        RegistrationForm form = formRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration form not found"));
        
        if (currentUser != null && currentUser.getRole() == Roles.FACULTY) {
            if (!currentUser.getUsername().equals(form.getCreatedBy())) {
                throw new ApiException("Access Denied: You can only delete forms you created.");
            }
        }

        // Delete image from Cloudinary before deleting the form
        if (form.getImagePublicId() != null && !form.getImagePublicId().isEmpty()) {
            cloudinaryService.deleteImage(form.getImagePublicId());
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

    public RegistrationForm updateEvaluationCriteria(String formId, List<EvaluationCriterion> criteria, User currentUser) {
        RegistrationForm form = formRepository.findById(formId)
                .orElseThrow(() -> new ApiException("Form not found"));

        if (currentUser != null && currentUser.getRole() == Roles.FACULTY) {
            if (!currentUser.getUsername().equals(form.getCreatedBy())) {
                throw new ApiException("Access Denied: You can only update evaluation criteria for forms you created.");
            }
        }

        form.setEvaluationCriteria(criteria);
        return formRepository.save(form);
    }
}
