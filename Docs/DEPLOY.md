# Deployment Guide

Deploy **frontend** and **backend** separately. Recommended: **Vercel** (frontend) + **Render** (backend).

## 0. Clone & run locally

```bash
git clone https://github.com/YOUR_USERNAME/Guessify.git
cd Guessify
```

### Backend

```bash
cd backend
cp .env.example .env          # optional for local overrides
mvn spring-boot:run
```

Verify: `curl http://localhost:8080/api/health`

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173**

---

## 1. Deploy Backend (Render)

### Option A — Render Dashboard

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your repo
4. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Docker (uses `backend/Dockerfile`)
   - **Health Check Path:** `/api/health`
5. Environment variables:

| Variable | Example |
|----------|---------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `GUESSIFY_DAILY_SECRET` | Long random string (`openssl rand -base64 48`) |
| `GUESSIFY_FRONTEND_BASE_URL` | `https://your-app.vercel.app` |
| `GUESSIFY_CORS_ORIGINS` | `https://your-app.vercel.app` |

6. Deploy → copy your API URL (e.g. `https://guessify-api.onrender.com`)

### Option B — Render Blueprint

Use `render.yaml` at repo root with Render Blueprint deploy.

---

## 2. Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Environment variable:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Render API URL (e.g. `https://guessify-api.onrender.com`) |

5. Deploy

`vercel.json` is included for SPA routing (all paths → `index.html`).

---

## 3. Post-Deploy Checklist

- [ ] Open frontend URL — home page loads
- [ ] `curl https://YOUR-API/api/health` returns `UP`
- [ ] Create a party room — no CORS errors in browser console
- [ ] Share link uses correct frontend domain
- [ ] QR code points to production URL

---

## 4. Custom Domain (Optional)

**Vercel:** Project Settings → Domains → add `guessify.yourdomain.com`

**Render:** Service Settings → Custom Domain → add `api.yourdomain.com`

Update env vars:
- `GUESSIFY_FRONTEND_BASE_URL` → your frontend domain
- `GUESSIFY_CORS_ORIGINS` → your frontend domain
- `VITE_API_URL` → your API domain (redeploy frontend)

---

## 5. Local Production Test

```bash
# Backend
cd backend && mvn package -DskipTests
SPRING_PROFILES_ACTIVE=prod java -jar target/guessify-backend-1.0.0.jar

# Frontend
cd frontend
VITE_API_URL=http://localhost:8080 npm run build
npm run preview
```

---

## 6. Keep the backend alive (Render free tier)

Render **free** services spin down after ~15 minutes without traffic. Players would see slow cold starts.

**Option A — GitHub Actions (included in this repo)**

1. Deploy backend and copy your API URL
2. GitHub repo → **Settings → Secrets → Actions**
3. Add `GUESSIFY_API_URL` = `https://your-api.onrender.com` (no trailing slash)
4. Workflow `.github/workflows/keepalive.yml` pings `/api/health` every 14 minutes

**Option B — UptimeRobot (free)**

1. Create monitor → HTTP(s) → URL `https://your-api.onrender.com/api/health`
2. Interval: 5 minutes

**Option C — Render paid plan**

Paid instances do not spin down on idle.

The backend process itself stays running 24/7 while the container is awake — game rooms and sessions are in-memory and persist until TTL (24h) or cleanup.

---

Built by Shivansh Bagga
