package com.campusarena.eventhub.club;

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

    public Club updateClub(Club newClub,String clubId) {
        Club club = clubRepository.findById(clubId).orElse(null);
        if(club == null){
            return null;
        }
        club.setName(newClub.getName());
        club.setClubCoordinatorName(newClub.getClubCoordinatorName());
        return clubRepository.save(club);
    }

    public boolean deleteClub(String clubId) {
        Club club = clubRepository.findById(clubId).orElse(null);
        if(club == null){
            return false;
        }
        clubRepository.deleteById(clubId);
        return true;
    }

    public Club getClub(String clubId) {
        Club club = clubRepository.findById(clubId).orElse(null);
        if(club == null){
            return null;
        }
        return club;
    }

    public List<Club> getClubs() {
        return clubRepository.findAll();
    }
}
