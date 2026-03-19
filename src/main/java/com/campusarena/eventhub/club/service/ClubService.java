package com.campusarena.eventhub.club.service;

import com.campusarena.eventhub.club.model.Club;
import com.campusarena.eventhub.club.repository.ClubRepository;
import com.campusarena.eventhub.exception.ResourceNotFoundException;
import com.campusarena.eventhub.upload.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClubService {

    private final ClubRepository clubRepository;
    private final CloudinaryService cloudinaryService;

    public Club insertClub(Club club) {
        return clubRepository.save(club);
    }

    public Club updateClub(Club newClub, String clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + clubId));
        
        // Delete old image from Cloudinary if a new one is provided
        if (newClub.getImage() != null && !newClub.getImage().isEmpty() 
                && !newClub.getImage().equals(club.getImage())
                && club.getImagePublicId() != null) {
            cloudinaryService.deleteImage(club.getImagePublicId());
        }

        club.setName(newClub.getName());
        club.setImage(newClub.getImage());
        club.setImagePublicId(newClub.getImagePublicId());
        club.setClubCoordinatorId(newClub.getClubCoordinatorId());
        club.setDescription(newClub.getDescription());
        club.setObjective(newClub.getObjective());
        club.setSubClubGroup(newClub.getSubClubGroup());
        return clubRepository.save(club);
    }

    public void deleteClub(String clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + clubId));
        
        // Delete image from Cloudinary before deleting the club
        if (club.getImagePublicId() != null && !club.getImagePublicId().isEmpty()) {
            cloudinaryService.deleteImage(club.getImagePublicId());
        }

        clubRepository.delete(club);
    }

    public Club getClub(String clubId) {
        return clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + clubId));
    }

    public List<Club> getClubs() {
        return clubRepository.findAll();
    }
}

