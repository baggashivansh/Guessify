# Guessify Documentation

| Document | Description |
|----------|-------------|
| [LOCAL_SETUP.md](LOCAL_SETUP.md) | Run locally, build, deploy |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design & data flow |
| [API.md](API.md) | REST API reference |
| [SECURITY.md](SECURITY.md) | Security model & checklist |

## Quick Local Run

```bash
# Terminal 1
cd backend && mvn spring-boot:run

# Terminal 2
cd frontend && npm install && npm run dev
```

Open http://localhost:5173
