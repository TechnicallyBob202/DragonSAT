# DragonSAT — Study. Sharpen. Soar.

A comprehensive SAT practice platform with three distinct modes: Study, Quiz, and Test. Built with Next.js and Node.js/Express, with SQLite for progress tracking and Google OAuth for authentication.

**Docker image:** [`technicallybob/dragonsat`](https://hub.docker.com/r/technicallybob/dragonsat)

---

## Features

- **Study Mode** — Learn at your own pace with immediate feedback and unlimited time
- **Quiz Mode** — Practice with a soft timer and end-of-session score summary
- **Test Mode** — Full SAT simulation with hard time limits and a post-test review screen
- **User Accounts** — Email/password registration with optional Google Sign-In
- **Progress Tracking** — All sessions and responses stored in SQLite
- **History & Stats** — Session history view with per-mode breakdowns and lifetime accuracy
- **Domain Filtering** — Study specific SAT question categories
- **Difficulty Selection** — Choose Easy, Medium, or Hard questions
- **LaTeX Rendering** — Full math expression support via KaTeX
- **Dark Mode** — Full light/dark theme support
- **Settings** — Configurable display name, sound effects, dark mode toggle, and data export

---

## Architecture

DragonSAT uses a **dual-window** design:

- **Main window** (`/`) — Sidebar layout with Dashboard, History, and Settings
- **Session window** (`/session?mode=...`) — Opened via `window.open()` when a session starts; runs independently and communicates back to the main window via `postMessage`

```
dragonsat/
├── frontend/              # Next.js 14 application
│   ├── app/
│   │   ├── page.tsx       # Main window (SetupLayout)
│   │   ├── session/       # Session window
│   │   └── api/proxy/     # Server-side API proxy
│   ├── components/        # React components
│   ├── hooks/             # Zustand stores + custom hooks
│   ├── utils/             # API client, parser, scoring, sounds
│   └── styles/
├── backend/               # Node.js/Express API server
│   └── src/
│       ├── routes/        # /api/questions, /api/progress, /api/auth
│       ├── services/      # OpenSAT client, progress logic
│       ├── middleware/     # JWT auth, CORS
│       └── db/            # SQLite schema + init
├── Dockerfile             # Multi-stage build
├── docker-compose.yml     # Single-container deployment
└── .env.example           # Environment variable template
```

---

## Quick Start — Docker

The easiest way to run DragonSAT.

### 1. Copy the environment template

```bash
cp .env.example .env
```

### 2. Edit `.env`

```env
# Required
JWT_SECRET=your-long-random-secret-here   # openssl rand -hex 32

# Optional — Google Sign-In (leave blank to disable)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

# Optional overrides
FRONTEND_URL=http://localhost:3000
```

### 3. Run

```bash
docker compose up -d
```

Open `http://localhost:3000`.

Data persists in `./data/dragonsat.db` via the mounted volume.

> **Note:** `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is baked into the Next.js bundle at build time.
> If you're pulling the pre-built image from DockerHub and want Google Sign-In, you must rebuild locally with that variable set.

---

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set JWT_SECRET and optionally Google OAuth vars
npm install
npm run dev
```

Runs on `http://localhost:3001`.

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL and optionally NEXT_PUBLIC_GOOGLE_CLIENT_ID
npm install
npm run dev
```

Runs on `http://localhost:3000`.

### Frontend environment

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` for local dev; `/api/proxy` in Docker |
| `BACKEND_URL` | Server-side proxy target (Docker only); not needed for local dev |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |

### Backend environment

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | |
| `PORT` | `3001` | Backend listen port |
| `DATABASE_PATH` | `./data/dragonsat.db` | SQLite file path |
| `OPENSAT_API_URL` | `https://pinesat.com/api/questions` | Question source |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |
| `JWT_SECRET` | — | **Required.** Sign with `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | — | Google OAuth (optional) |
| `GOOGLE_CLIENT_SECRET` | — | Google OAuth (optional) |

---

## API Endpoints

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register with name, email, password |
| `POST` | `/api/auth/login` | Login with email + password |
| `GET` | `/api/auth/me` | Get current user (JWT required) |
| `PATCH` | `/api/auth/profile` | Update display name (JWT required) |
| `POST` | `/api/auth/google` | Sign in with Google access token |
| `POST` | `/api/auth/google/link` | Link Google to existing account |

### Questions

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/questions` | Get filtered questions (`domain`, `difficulty`, `limit`) |
| `GET` | `/api/questions/:id` | Get a specific question |
| `GET` | `/api/domains` | List available domains |
| `GET` | `/api/cache-status` | Check if OpenSAT data is loaded |

### Progress

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/progress/user` | Create or get user record |
| `POST` | `/api/progress/session/start` | Start a session |
| `POST` | `/api/progress/session/end` | End session with score |
| `POST` | `/api/progress/response` | Record a question response |
| `GET` | `/api/progress/session/:id` | Get responses for a session |
| `GET` | `/api/progress/user/:id` | Get user stats and history |

---

## Session Modes

| Mode | Timer | Feedback | Navigation |
|---|---|---|---|
| Study | None | Immediate (Check Answer) | Free |
| Quiz | Soft cap | End of session | Linear (Next) |
| Test | Hard stop | Score report + review | Linear + review screen |

---

## Technologies

**Frontend:** Next.js 14, React 18, TypeScript, Zustand, Tailwind CSS, KaTeX, react-markdown

**Backend:** Express.js, SQLite (better-sqlite3), TypeScript, Axios, JWT (jsonwebtoken)

---

## CI/CD

Pushes to `main` automatically build and publish a multi-platform Docker image to DockerHub via GitHub Actions.

```
technicallybob/dragonsat:latest
technicallybob/dragonsat:<sha>
```

See [`.github/workflows/docker-publish.yml`](.github/workflows/docker-publish.yml).

Required repository secrets:

| Secret | Description |
|---|---|
| `DOCKERHUB_USERNAME` | DockerHub username |
| `DOCKERHUB_TOKEN` | DockerHub access token |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | (Optional) Baked into the published image |

---

## Troubleshooting

**Backend won't start** — Verify port 3001 is free. Check `DATABASE_PATH` directory is writable.

**Frontend can't reach backend** — Confirm `NEXT_PUBLIC_API_URL` matches where the backend is running. In Docker, this is `/api/proxy` (server-side proxy).

**Questions not loading** — Check `/api/cache-status`. Backend fetches the OpenSAT dataset on startup and caches it in memory. If it fails, check network access to `pinesat.com`.

**Google Sign-In button not showing** — `NEXT_PUBLIC_GOOGLE_CLIENT_ID` must be set at build time (it's baked into the Next.js bundle). Restart the dev server after adding it to `.env.local`.

**Session window won't open** — Some browsers block `window.open()` if not triggered directly from a user gesture. Ensure pop-ups are allowed for the app's origin.

---

## License

MIT — see [LICENSE](LICENSE).
