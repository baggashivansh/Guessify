package com.guessify.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.guessify.model.Difficulty;
import com.guessify.model.GuessResult;
import com.guessify.model.RoomStatus;
import com.guessify.model.Warmth;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public final class Dtos {

    private Dtos() {}

    // --- Requests ---

    public record CreateRoomRequest(
            @NotBlank String nickname,
            @NotNull Difficulty difficulty
    ) {}

    public record JoinRoomRequest(@NotBlank String nickname) {}

    public record GuessRequest(
            @NotNull @jakarta.validation.constraints.Min(1) @jakarta.validation.constraints.Max(1000) Integer value
    ) {}

    public record CreateChallengeRequest(
            @NotBlank String nickname,
            @NotNull Difficulty difficulty,
            @NotNull Integer guesses,
            @NotNull Long timeMs
    ) {} // retained for internal use only

    // removed public create endpoint — challenges only via completed solo session

    public record StartChallengeRequest(@NotBlank String nickname) {}

    public record StartDailyRequest(@NotBlank String nickname) {}

    public record StartSoloRequest(@NotBlank String nickname, @NotNull Difficulty difficulty) {}

    public record CreateChallengeFromSoloRequest(@NotBlank String sessionToken) {}

    // --- Responses ---

    public record CreateRoomResponse(
            String code,
            String playerId,
            String sessionToken,
            String nickname,
            String joinUrl
    ) {}

    public record PlayerTokenResponse(
            String playerId,
            String sessionToken,
            String nickname
    ) {}

    public record PlayerSummary(
            String id,
            String nickname,
            int guessCount,
            boolean finished,
            Long elapsedMs,
            Integer rank
    ) {}

    public record RoomResponse(
            String code,
            Difficulty difficulty,
            RoomStatus status,
            int round,
            String hostPlayerId,
            List<PlayerSummary> players,
            String joinUrl,
            boolean canStart,
            int maxPlayers
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record GuessResponse(
            GuessResult result,
            Warmth warmth,
            int guessCount,
            boolean finished,
            Long elapsedMs,
            Integer secretNumber
    ) {}

    public record LeaderboardEntry(
            String nickname,
            int guessCount,
            long elapsedMs,
            int rank,
            boolean isWinner
    ) {}

    public record GameResultResponse(
            List<LeaderboardEntry> leaderboard,
            int secretNumber,
            boolean allFinished
    ) {}

    public record ChallengeInfoResponse(
            String code,
            Difficulty difficulty,
            String creatorNickname,
            int creatorGuesses,
            long creatorTimeMs,
            String challengeUrl,
            int attemptCount
    ) {}

    public record ChallengeCreatedResponse(
            String code,
            String challengeUrl
    ) {}

    public record DailyInfoResponse(
            Difficulty difficulty,
            String date,
            boolean alreadyPlayed,
            int minRange,
            int maxRange
    ) {}

    public record HealthResponse(String status, String service) {}
}
