package com.guessify.controller;

import com.guessify.dto.Dtos;
import com.guessify.model.Difficulty;
import com.guessify.service.DailyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/daily")
public class DailyController {

    private final DailyService dailyService;

    public DailyController(DailyService dailyService) {
        this.dailyService = dailyService;
    }

    @GetMapping("/{difficulty}")
    public ResponseEntity<Dtos.DailyInfoResponse> info(
            @PathVariable Difficulty difficulty,
            @RequestHeader(value = "X-Client-Id", required = false) String clientId) {
        return ResponseEntity.ok(dailyService.getDailyInfo(difficulty, resolveClientId(clientId)));
    }

    @PostMapping("/{difficulty}/start")
    public ResponseEntity<Dtos.PlayerTokenResponse> start(
            @PathVariable Difficulty difficulty,
            @Valid @RequestBody Dtos.StartDailyRequest request,
            @RequestHeader(value = "X-Client-Id", required = false) String clientId) {
        return ResponseEntity.ok(dailyService.startDaily(difficulty, request, resolveClientId(clientId)));
    }

    @PostMapping("/{difficulty}/guess")
    public ResponseEntity<Dtos.GuessResponse> guess(
            @PathVariable Difficulty difficulty,
            @RequestHeader("X-Player-Token") String sessionToken,
            @Valid @RequestBody Dtos.GuessRequest request,
            @RequestHeader(value = "X-Client-Id", required = false) String clientId) {
        return ResponseEntity.ok(dailyService.submitGuess(difficulty, sessionToken, request, resolveClientId(clientId)));
    }

    private String resolveClientId(String clientId) {
        return clientId != null && !clientId.isBlank() ? clientId : "anonymous";
    }
}
