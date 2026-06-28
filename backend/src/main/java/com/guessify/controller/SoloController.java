package com.guessify.controller;

import com.guessify.dto.Dtos;
import com.guessify.service.SoloService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/solo")
public class SoloController {

    private final SoloService soloService;

    public SoloController(SoloService soloService) {
        this.soloService = soloService;
    }

    @PostMapping("/start")
    public ResponseEntity<Dtos.PlayerTokenResponse> start(@Valid @RequestBody Dtos.StartSoloRequest request) {
        return ResponseEntity.ok(soloService.start(request));
    }

    @PostMapping("/guess")
    public ResponseEntity<Dtos.GuessResponse> guess(
            @RequestHeader("X-Player-Token") String sessionToken,
            @Valid @RequestBody Dtos.GuessRequest request) {
        return ResponseEntity.ok(soloService.guess(sessionToken, request));
    }

    @PostMapping("/challenge")
    public ResponseEntity<Dtos.ChallengeCreatedResponse> createChallenge(
            @RequestHeader("X-Player-Token") String sessionToken) {
        return ResponseEntity.ok(soloService.createChallenge(sessionToken));
    }
}
