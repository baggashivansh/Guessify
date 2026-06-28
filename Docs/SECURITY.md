# Security

## Core Principle

**The secret number lives only on the server.** The frontend cannot read, set, or override game outcomes. URLs are for navigation only — every action is authorized server-side.

## Threat Model

| Attack | Mitigation |
|--------|------------|
| Change room/challenge code in URL | Session bound to exact resource code on server; frontend rejects invalid codes |
| Reuse another player's token | Token bound to player ID + resource; constant-time validation |
| Use party token in different room | `SESSION_MISMATCH` — token scoped to room code |
| Use challenge token on wrong challenge | `attemptToChallenge` map + `SecureSessionService` binding |
| Guess secret via results API | Results require authenticated player session |
| Brute-force room codes | Rate-limited lookups; 6-char cryptographically random codes |
| Forge session tokens | 256-bit random tokens; server-side registry (not client-generated) |
| CSRF from random sites | CORS allowlist + Origin required on mutations (production) |
| XSS stealing tokens | `sessionStorage` (not localStorage) for game sessions; short TTL |
| Spam guesses | Rate limit + max 50 guesses per game server-side |

## Server-Side Protections

### 1. Secure Session Binding (`SecureSessionService`)

Every session token is registered with:
- **Scope** — `PARTY`, `SOLO`, `CHALLENGE`, `DAILY`
- **Resource ID** — room code, challenge code, difficulty, etc.
- **Subject ID** — player UUID
- **Expiry** — 24 hours (configurable)

All privileged API calls validate: `token + scope + resource + subject`.

### 2. Secret Number Isolation

Never exposed until the player correctly guesses or views authorized results.

### 3. Input Validation

| Input | Rule |
|-------|------|
| Room/challenge code | `^[A-Z2-9]{6}$` only |
| Session token | 32–128 chars, URL-safe base64 |
| Player ID | UUID format |
| Client ID | UUID format |
| Nickname | Alphanumeric + space/hyphen/underscore, max 20 |
| Guess | Integer within difficulty range |

### 4. Rate Limiting

- 2 guesses/second per player
- 120 API requests/minute per client key
- Room lookup rate limited per code

### 5. HTTP Security Headers

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cache-Control: no-store`
- `Content-Security-Policy` on API responses

### 6. CORS

Explicit allowlist of frontend origins. Only required headers permitted:
`Content-Type`, `X-Player-Id`, `X-Player-Token`, `X-Client-Id`, `Accept`, `Origin`.

### 7. Origin Validation (Production)

POST/PUT/PATCH/DELETE require `Origin` header matching allowlist.

## Frontend Protections

### URL Integrity

- Invalid codes in URL → redirect home
- Party session stored in `sessionStorage` keyed by room code
- Changing URL without valid session → forced re-join
- Share links built from `window.location.origin` only (no external redirect URLs)

### API Client

- Validates all codes before requests
- Credentials sent only via headers (never in query strings)
- `cache: 'no-store'` on all API calls
- Integer validation on guesses client-side (server re-validates)

## Production Checklist

- [ ] HTTPS on frontend and backend
- [ ] `GUESSIFY_CORS_ORIGINS` = production domain only
- [ ] `GUESSIFY_FRONTEND_BASE_URL` = production URL
- [ ] `SPRING_PROFILES_ACTIVE=prod`
- [ ] `require-origin-on-mutations: true`
- [ ] Do not expose Spring actuator publicly

## Honest Limits

No web app has "zero vulnerabilities." Remaining considerations for scale:

- In-memory sessions reset on server restart (use Redis for HA)
- Client ID in localStorage can be cleared (daily puzzle replay) — acceptable for casual game
- Determined attacker with browser devtools can still play their own game normally

Built by Shivansh Bagga
