# Local Setup Guide

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Java | 21+ | `java -version` |
| Maven | 3.9+ | `mvn -version` |
| Node.js | 18+ | `node -version` |
| npm | 9+ | `npm -version` |

## Running Locally

### Terminal 1 — Backend

```bash
cd backend
mvn spring-boot:run
```

Verify: `curl http://localhost:8080/api/health`

Expected:
```json
{"status":"UP","service":"guessify-backend"}
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

The Vite dev server proxies `/api` requests to `http://localhost:8080`.

## Testing Party Mode Locally

1. Go to **Party Mode** → Create a room with nickname "Host"
2. Copy the room link or scan QR (use your phone on same WiFi, or open in incognito)
3. Join as "Player 2" in the second browser/tab
4. Host clicks **Start Game**
5. Both players guess — fewest guesses wins
6. Host can click **Rematch** on the results screen

## Testing Async Mode Locally

1. Go to **Async Challenge** → **Play & Share Challenge**
2. Complete the game
3. Copy the challenge link
4. Open in another browser as a different player
5. Try to beat the original score

## Testing Daily Puzzle

1. Go to **Async Challenge** → pick a daily difficulty
2. Complete once — you cannot replay the same difficulty today (tracked per browser via client ID)

## Environment Variables

### Frontend

Copy the example file:

```bash
cd frontend
cp .env.example .env
```

```env
# Leave empty for local dev (Vite proxy handles /api)
VITE_API_URL=
```

For production builds, set `VITE_API_URL` to your backend URL (e.g. `https://guessify-api.onrender.com`).

### Backend

Copy the example file (optional for local dev):

```bash
cd backend
cp .env.example .env
```

| Variable | Local | Production |
|----------|-------|------------|
| `SPRING_PROFILES_ACTIVE` | (default) | `prod` |
| `GUESSIFY_DAILY_SECRET` | dev default in `application.yml` | **Required** — random string |
| `GUESSIFY_FRONTEND_BASE_URL` | `http://localhost:5173` | Your Vercel URL |
| `GUESSIFY_CORS_ORIGINS` | `http://localhost:5173` | Your Vercel URL |
| `PORT` | `8080` | Set by host (Render) |

See [`backend/.env.example`](../backend/.env.example) for the full list.

Alternatively, edit `backend/src/main/resources/application.yml` for local CORS/URL overrides.

## Production Build

### Backend

```bash
cd backend
mvn clean package -DskipTests
java -jar target/guessify-backend-1.0.0.jar
```

### Frontend

```bash
cd frontend
npm run build
npm run preview   # preview at http://localhost:4173
```

Serve `frontend/dist/` with any static host (Vercel, Netlify, Nginx).

## Deployment

1. Deploy backend (Railway, Render, AWS, etc.) — expose port 8080
2. Set `guessify.frontend-base-url` and CORS to your frontend domain
3. Deploy frontend static build
4. Set `VITE_API_URL` to backend URL at build time

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | Ensure backend `allowed-origins` includes your frontend URL |
| Room not found | Rooms expire after 24 hours of inactivity cleanup |
| Rate limited | Wait a few seconds between rapid guesses |
| Backend won't start | Check port 8080 is free: `lsof -i :8080` |
