package com.guessify;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void rejectsInvalidRoomCodeFormat() throws Exception {
        mockMvc.perform(get("/api/rooms/INVALID!"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cannotGuessInRoomWithoutValidSession() throws Exception {
        JsonNode room = createRoom("Host", "EASY");
        String code = room.get("code").asText();

        mockMvc.perform(post("/api/rooms/" + code + "/guess")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Player-Id", room.get("playerId").asText())
                        .header("X-Player-Token", "invalid-token-12345678901234567890123456789012")
                        .content("{\"value\":50}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void cannotUseSessionFromAnotherRoom() throws Exception {
        JsonNode roomA = createRoom("HostA", "EASY");
        JsonNode roomB = createRoom("HostB", "EASY");

        mockMvc.perform(post("/api/rooms/" + roomB.get("code").asText() + "/guess")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Player-Id", roomA.get("playerId").asText())
                        .header("X-Player-Token", roomA.get("sessionToken").asText())
                        .content("{\"value\":50}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void cannotViewResultsWithoutSession() throws Exception {
        JsonNode room = createRoom("Host", "EASY");
        mockMvc.perform(get("/api/rooms/" + room.get("code").asText() + "/results")
                        .header("X-Player-Id", room.get("playerId").asText())
                        .header("X-Player-Token", "invalid-token-12345678901234567890123456789012"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void cannotForgeChallengeWithFakeScoreEndpoint() throws Exception {
        mockMvc.perform(post("/api/challenges")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nickname":"Cheater","difficulty":"EASY","guesses":1,"timeMs":100}
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    void secretNotLeakedBeforeCorrectGuess() throws Exception {
        JsonNode room = createRoom("Host", "EASY");
        String code = room.get("code").asText();
        String playerId = room.get("playerId").asText();
        String token = room.get("sessionToken").asText();

        startRoom(code, playerId, token);

        MvcResult guess = mockMvc.perform(post("/api/rooms/" + code + "/guess")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Player-Id", playerId)
                        .header("X-Player-Token", token)
                        .content("{\"value\":50}"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(guess.getResponse().getContentAsString());
        assertFalse(body.hasNonNull("secretNumber"));
        assertFalse(body.get("finished").asBoolean());
    }

    @Test
    void rejectsOutOfRangeGuess() throws Exception {
        JsonNode room = createRoom("Host", "EASY");
        String code = room.get("code").asText();
        startRoom(code, room.get("playerId").asText(), room.get("sessionToken").asText());

        mockMvc.perform(post("/api/rooms/" + code + "/guess")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Player-Id", room.get("playerId").asText())
                        .header("X-Player-Token", room.get("sessionToken").asText())
                        .content("{\"value\":5000}"))
                .andExpect(status().isBadRequest());
    }

    private JsonNode createRoom(String nickname, String difficulty) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nickname\":\"" + nickname + "\",\"difficulty\":\"" + difficulty + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private void startRoom(String code, String playerId, String token) throws Exception {
        mockMvc.perform(post("/api/rooms/" + code + "/start")
                        .header("X-Player-Id", playerId)
                        .header("X-Player-Token", token))
                .andExpect(status().isOk());
    }
}
