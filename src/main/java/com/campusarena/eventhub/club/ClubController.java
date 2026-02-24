package com.campusarena.eventhub.club;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/admin/club")
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
        Club club = clubService.getClub(id);
        if (club == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(club, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Club> createClub(@RequestBody Club club) {
        return new ResponseEntity<>(clubService.insertClub(club), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Club> deleteClubById(@PathVariable String id) {
        boolean result = clubService.deleteClub(id);
        if (result) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Club> updateClubById(@PathVariable String id, @RequestBody Club club) {
        Club clubUpdate = clubService.updateClub(club,id);
        if (clubUpdate == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(club, HttpStatus.OK);
    }

}
