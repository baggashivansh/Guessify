# Architecture

## Overview

Guessify is a split-stack web application:

```
┌─────────────────┐         REST API          ┌─────────────────┐
│                 │  ───────────────────────►  │                 │
│  React Frontend │         JSON              │  Java Backend   │
│  (Vite + TS)    │  ◄───────────────────────  │  (Spring Boot)  │
│                 │                            │                 │
└─────────────────┘                            └─────────────────┘
     Web only                                      Game logic,
     Premium UI                                    secrets, validation
```

The **secret number never leaves the backend** until a player correctly guesses or the game ends.

## Game Modes

### Party Mode (Live)

```
Host creates room → Players join via link/QR → Host starts → Everyone guesses
→ Live standings (polling) → Results podium → Rematch
```

- All players share the **same secret number** in a room
- Room state polled every 3 seconds from frontend
- Host controls start and rematch

### Async Challenge

```
Player plays solo → Wins → Challenge link created (same number/seed)
→ Friend opens link → Plays same number → Head-to-head comparison
```

### Daily Puzzle

```
One seeded number per difficulty per UTC day → Same for all players
→ One play per client per difficulty per day
```

## Backend Layers

```
Controller  →  Service  →  In-Memory Store
    │              │
    │              └── GameLogic, RateLimit, InputSanitizer
    └── DTOs, Validation, Exception handling
```

| Package | Responsibility |
|---------|----------------|
| `controller` | REST endpoints, request headers |
| `service` | Business logic per game mode |
| `model` | Domain entities (Room, Challenge, etc.) |
| `dto` | API request/response records |
| `util` | Game logic, rate limiting, sanitization |
| `config` | CORS, properties |
| `scheduler` | Expired room cleanup, rate limit reset |

## Frontend Structure

```
src/
├── api/          # HTTP client
├── components/   # Reusable UI (GameBoard, Leaderboard, QR, etc.)
├── pages/        # Route-level screens
├── types/        # TypeScript interfaces
└── utils/        # Storage, sound, clipboard
```

## State Management

- **No global state library** — each page manages its own state
- **localStorage** for: client ID, nickname, party session tokens
- **Server is source of truth** for all game state

## Data Storage (v1)

In-memory `ConcurrentHashMap` — suitable for local dev and small deployments.

For production scale, migrate to Redis or a database without changing the API contract.

## Polling vs WebSockets

Party mode uses **HTTP polling** (3s interval) for simplicity and reliability. WebSockets can be added in v2 for instant updates.

## Seeded Random Numbers

```java
Random rng = new Random(seed);
number = min + rng.nextInt(max - min + 1);
```

- **Party rooms**: random seed per round
- **Challenges**: seed from creator's solo game (same number for challengers)
- **Daily**: seed derived from `date + difficulty` (deterministic per day)
