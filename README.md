# Guessify

**Guess the number. Fewest guesses wins.**

A premium web game with Party Mode (live with friends) and Async Challenge (solo play, challenge links, daily puzzle).

Built by **Shivansh Bagga**.

## Quick Start (Local)

### Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 18+

### 1. Backend

```bash
cd backend
cp .env.example .env    # optional — defaults work for local dev
mvn spring-boot:run
```

API: `http://localhost:8080` — health check: `curl http://localhost:8080/api/health`

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173` (Vite proxies `/api` to the backend)

### 3. Play

1. Open `http://localhost:5173`
2. **Party Mode** — Create a room, join from another tab/browser
3. **Async Challenge** — Play solo, share the challenge link, try the daily puzzle

## Environment files

| File | Purpose |
|------|---------|
| [`backend/.env.example`](backend/.env.example) | Backend env vars (`GUESSIFY_DAILY_SECRET`, CORS, URLs) |
| [`frontend/.env.example`](frontend/.env.example) | Frontend `VITE_API_URL` (empty = local proxy) |

Copy each to `.env` — **never commit `.env` files** (they are gitignored).

## Project Structure

```
Guessify/
├── backend/     # Java Spring Boot API
├── frontend/    # React + Vite + Tailwind
├── Docs/        # Full documentation
└── render.yaml  # Render Blueprint for backend deploy
```

## Documentation

| Doc | Description |
|-----|-------------|
| [Local Setup](Docs/LOCAL_SETUP.md) | Detailed setup & troubleshooting |
| [Architecture](Docs/ARCHITECTURE.md) | System design & data flow |
| [API Reference](Docs/API.md) | All backend endpoints |
| [Security](Docs/SECURITY.md) | Security model & practices |
| [Deployment](Docs/DEPLOY.md) | Deploy to Vercel + Render + keep-alive |

## Game Modes

| Mode | Description |
|------|-------------|
| **Party** | Live multiplayer room with QR join, rematch, leaderboard |
| **Async Challenge** | Play solo → share link → friends beat your score |
| **Daily Puzzle** | One puzzle per difficulty per day |

## Difficulty Levels

| Level | Range |
|-------|-------|
| Easy | 1–100 |
| Medium | 1–500 |
| Hard | 1–1000 |

## Deploy

See **[Docs/DEPLOY.md](Docs/DEPLOY.md)** for Vercel (frontend) + Render (backend), env vars, and keeping the API warm on free tier.

## License

Private project — all rights reserved.
