package com.guessify.controller;

import com.guessify.dto.Dtos;
import com.guessify.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<Dtos.CreateRoomResponse> createRoom(@Valid @RequestBody Dtos.CreateRoomRequest request) {
        return ResponseEntity.ok(roomService.createRoom(request));
    }

    @GetMapping("/{code}")
    public ResponseEntity<Dtos.RoomResponse> getRoom(@PathVariable String code) {
        return ResponseEntity.ok(roomService.getRoom(code));
    }

    @PostMapping("/{code}/join")
    public ResponseEntity<Dtos.PlayerTokenResponse> joinRoom(
            @PathVariable String code,
            @Valid @RequestBody Dtos.JoinRoomRequest request) {
        return ResponseEntity.ok(roomService.joinRoom(code, request));
    }

    @PostMapping("/{code}/start")
    public ResponseEntity<Dtos.RoomResponse> startGame(
            @PathVariable String code,
            @RequestHeader("X-Player-Id") String playerId,
            @RequestHeader("X-Player-Token") String sessionToken) {
        return ResponseEntity.ok(roomService.startGame(code, playerId, sessionToken));
    }

    @PostMapping("/{code}/guess")
    public ResponseEntity<Dtos.GuessResponse> guess(
            @PathVariable String code,
            @RequestHeader("X-Player-Id") String playerId,
            @RequestHeader("X-Player-Token") String sessionToken,
            @Valid @RequestBody Dtos.GuessRequest request) {
        return ResponseEntity.ok(roomService.submitGuess(code, playerId, sessionToken, request));
    }

    @GetMapping("/{code}/results")
    public ResponseEntity<Dtos.GameResultResponse> results(
            @PathVariable String code,
            @RequestHeader("X-Player-Id") String playerId,
            @RequestHeader("X-Player-Token") String sessionToken) {
        return ResponseEntity.ok(roomService.getResults(code, playerId, sessionToken));
    }

    @PostMapping("/{code}/rematch")
    public ResponseEntity<Dtos.RoomResponse> rematch(
            @PathVariable String code,
            @RequestHeader("X-Player-Id") String playerId,
            @RequestHeader("X-Player-Token") String sessionToken) {
        return ResponseEntity.ok(roomService.rematch(code, playerId, sessionToken));
    }

    @GetMapping("/{code}/state")
    public ResponseEntity<Dtos.RoomResponse> state(
            @PathVariable String code,
            @RequestHeader("X-Player-Id") String playerId,
            @RequestHeader("X-Player-Token") String sessionToken) {
        return ResponseEntity.ok(roomService.getRoomForPlayer(code, playerId, sessionToken));
    }
}
