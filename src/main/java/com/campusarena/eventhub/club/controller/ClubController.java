package com.campusarena.eventhub.club.controller;

import com.campusarena.eventhub.club.model.Club;
import com.campusarena.eventhub.club.service.ClubService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/clubs")
@RestController
@RequiredArgsConstructor
public class ClubController {
    private final ClubService clubService;

    @GetMapping
    public ResponseEntity<List<Club>> getAllClub() {
        return new ResponseEntity<>(clubService.getClubs(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Club> getClubById(@PathVariable String id) {
        return new ResponseEntity<>(clubService.getClub(id), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Club> createClub(@Valid @RequestBody Club club) {
        return new ResponseEntity<>(clubService.insertClub(club), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClubById(@PathVariable String id) {
        clubService.deleteClub(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Club> updateClubById(@PathVariable String id, @Valid @RequestBody Club club) {
        return new ResponseEntity<>(clubService.updateClub(club, id), HttpStatus.OK);
    }
}
