package com.guessify.controller;

import com.guessify.dto.Dtos;
import com.guessify.service.ChallengeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {

    private final ChallengeService challengeService;

    public ChallengeController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    @GetMapping("/{code}")
    public ResponseEntity<Dtos.ChallengeInfoResponse> get(@PathVariable String code) {
        return ResponseEntity.ok(challengeService.getChallenge(code));
    }

    @PostMapping("/{code}/start")
    public ResponseEntity<Dtos.PlayerTokenResponse> start(
            @PathVariable String code,
            @Valid @RequestBody Dtos.StartChallengeRequest request) {
        return ResponseEntity.ok(challengeService.startChallenge(code, request));
    }

    @PostMapping("/{code}/guess")
    public ResponseEntity<Dtos.GuessResponse> guess(
            @PathVariable String code,
            @RequestHeader("X-Player-Token") String sessionToken,
            @Valid @RequestBody Dtos.GuessRequest request) {
        return ResponseEntity.ok(challengeService.submitGuess(code, sessionToken, request));
    }

    @GetMapping("/{code}/result")
    public ResponseEntity<Dtos.GameResultResponse> result(
            @PathVariable String code,
            @RequestHeader("X-Player-Token") String sessionToken) {
        return ResponseEntity.ok(challengeService.getChallengeResult(code, sessionToken));
    }
}
