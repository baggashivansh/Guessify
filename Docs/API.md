# API Reference

Base URL: `http://localhost:8080` (local)

All requests/responses are `application/json`.

## Authentication Model

No user accounts. Players authenticate per-session with headers:

| Header | Used for |
|--------|----------|
| `X-Player-Id` | Party mode player ID |
| `X-Player-Token` | Session token (party, solo, challenge, daily) |
| `X-Client-Id` | Browser client ID (daily puzzle tracking) |

## Health

### `GET /api/health`

```json
{ "status": "UP", "service": "guessify-backend" }
```

---

## Party Mode

### `POST /api/rooms`

Create a party room.

**Body:**
```json
{ "nickname": "Host", "difficulty": "EASY" }
```

**Response:**
```json
{
  "code": "ABC123",
  "playerId": "uuid",
  "sessionToken": "uuid",
  "nickname": "Host",
  "joinUrl": "http://localhost:5173/party/ABC123"
}
```

### `GET /api/rooms/{code}`

Get room state (public).

### `POST /api/rooms/{code}/join`

**Body:** `{ "nickname": "Player2" }`

### `POST /api/rooms/{code}/start`

Headers: `X-Player-Id`, `X-Player-Token` (host only)

### `POST /api/rooms/{code}/guess`

**Body:** `{ "value": 50 }`

**Response:**
```json
{
  "result": "HIGHER",
  "warmth": "WARM",
  "guessCount": 3,
  "finished": false,
  "elapsedMs": null,
  "secretNumber": null
}
```

On correct guess, `secretNumber` is revealed.

### `GET /api/rooms/{code}/results`

Leaderboard with secret number.

### `POST /api/rooms/{code}/rematch`

Host only. Resets all players, new secret number, status → PLAYING.

---

## Solo / Challenge

### `POST /api/solo/start`

**Body:** `{ "nickname": "You", "difficulty": "MEDIUM" }`

### `POST /api/solo/guess`

Header: `X-Player-Token`

### `POST /api/solo/challenge`

**Body:** `{ "sessionToken": "..." }` — after completing solo game.

Creates challenge with **same secret number**.

### `GET /api/challenges/{code}`

Challenge info (creator score, difficulty).

### `POST /api/challenges/{code}/start`

**Body:** `{ "nickname": "Challenger" }`

### `POST /api/challenges/{code}/guess`

Header: `X-Player-Token`

### `GET /api/challenges/{code}/result`

Header: `X-Player-Token` — head-to-head comparison.

---

## Daily Puzzle

### `GET /api/daily/{difficulty}`

Header: `X-Client-Id` (optional)

**Response:**
```json
{
  "difficulty": "EASY",
  "date": "2026-06-28",
  "alreadyPlayed": false,
  "minRange": 1,
  "maxRange": 100
}
```

### `POST /api/daily/{difficulty}/start`

**Body:** `{ "nickname": "You" }`

### `POST /api/daily/{difficulty}/guess`

Header: `X-Player-Token`, `X-Client-Id`

---

## Error Format

```json
{
  "code": "ROOM_NOT_FOUND",
  "message": "Room not found",
  "timestamp": "2026-06-28T12:00:00Z"
}
```

| HTTP | Code | Meaning |
|------|------|---------|
| 400 | OUT_OF_RANGE | Guess outside difficulty range |
| 401 | UNAUTHORIZED | Invalid/missing session |
| 403 | NOT_HOST | Only host can perform action |
| 404 | ROOM_NOT_FOUND | Invalid room/challenge code |
| 409 | GAME_STARTED | Already started / nickname taken |
| 429 | RATE_LIMIT | Too many requests |
