package com.campusarena.eventhub.club.service;

import com.campusarena.eventhub.club.model.Club;
import com.campusarena.eventhub.club.repository.ClubRepository;
import com.campusarena.eventhub.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClubService {

    private final ClubRepository clubRepository;

    public Club insertClub(Club club) {
        return clubRepository.save(club);
    }

    public Club updateClub(Club newClub, String clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + clubId));
        
        club.setName(newClub.getName());
        club.setImage(newClub.getImage());
        club.setClubCoordinatorId(newClub.getClubCoordinatorId());
        return clubRepository.save(club);
    }

    public void deleteClub(String clubId) {
        if (!clubRepository.existsById(clubId)) {
            throw new ResourceNotFoundException("Club not found with id: " + clubId);
        }
        clubRepository.deleteById(clubId);
    }

    public Club getClub(String clubId) {
        return clubRepository.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + clubId));
    }

    public List<Club> getClubs() {
        return clubRepository.findAll();
    }
}
