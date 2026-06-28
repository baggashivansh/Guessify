package com.guessify.controller;

import com.guessify.dto.Dtos;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Dtos.HealthResponse> health() {
        return ResponseEntity.ok(new Dtos.HealthResponse("UP", "guessify-backend"));
    }
}
