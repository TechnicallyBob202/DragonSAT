# HapaSAT - SAT Prep Web Application

A comprehensive SAT practice platform with three distinct modes: Study, Quiz, and Test. Built with Next.js (frontend) and Node.js/Express (backend) with SQLite for progress tracking.

## Features

- **Study Mode**: Learn at your own pace with immediate feedback and unlimited time
- **Quiz Mode**: Practice with a soft timer and end-of-session feedback
- **Test Mode**: Full SAT simulation with hard time limits and review screen
- **Progress Tracking**: SQLite database stores all sessions and responses
- **LaTeX Rendering**: Full math expression support with KaTeX
- **Domain Filtering**: Study specific question categories
- **Difficulty Selection**: Choose Easy, Medium, or Hard questions

## Project Structure

```
hapasat/
├── frontend/          # Next.js application
│   ├── app/          # Page routes
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks (Zustand stores, useTimer, etc.)
│   ├── utils/        # Utilities (API, parsing, scoring)
│   └── styles/       # Global CSS
├── backend/          # Node.js/Express server
│   └── src/
│       ├── routes/   # API endpoints
│       ├── services/ # Business logic
│       ├── db/       # Database setup
│       └── types/    # TypeScript interfaces
└── README.md
```

## Prerequisites

- Node.js 16+
- npm or yarn

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd HapaSAT
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Build (optional, for production)
npm run build

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup (in a new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. Access the Application

Open `http://localhost:3000` in your browser.

## Available Scripts

### Backend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Check TypeScript types

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

## Environment Configuration

### Backend (.env)

```
NODE_ENV=development
PORT=3001
DATABASE_PATH=./data/hapasat.db
OPENSAT_API_URL=https://api.jsonsilo.com/public/942c3c3b-3a0c-4be3-81c2-12029def19f5
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=HapaSAT
```

## API Endpoints

### Questions

- `GET /api/questions` - Get filtered questions
  - Query params: `domain`, `difficulty`, `limit`
- `GET /api/questions/:id` - Get specific question
- `GET /api/domains` - Get available domains
- `GET /api/cache-status` - Check if OpenSAT data is loaded

### Progress

- `POST /api/progress/user` - Create or get user
- `POST /api/progress/session/start` - Start a new session
- `POST /api/progress/session/end` - End session with score
- `POST /api/progress/response` - Record question response
- `GET /api/progress/session/:sessionId` - Get session responses
- `GET /api/progress/user/:userId` - Get user progress and stats

## Data Structure

### Session Modes

| Mode | Timer | Feedback | Navigation |
|------|-------|----------|-----------|
| Study | None | Immediate (Check Answer) | Free |
| Quiz | Soft Cap | End of session only | Linear (Next) |
| Test | Hard Stop | Score report only | Linear + Review |

### Database Schema

- **users**: User accounts with creation timestamp
- **sessions**: Quiz/test attempts with scores
- **responses**: Individual question responses with timing

## Development Workflow in LXC

If developing in an LXC container:

1. Mount your project directory in the LXC
2. Install Node.js in the container: `apt-get install nodejs npm`
3. Follow the setup steps above
4. Access via the LXC's IP address: `http://<lxc-ip>:3000`

## State Management

- **Zustand Stores**:
  - `useAssessmentStore` - Current session state, questions, responses
  - `useProgressStore` - Historical sessions, user statistics

## Technologies

### Frontend
- Next.js 14
- React 18
- TypeScript
- Zustand (state management)
- Tailwind CSS (styling)
- KaTeX (math rendering)
- react-markdown

### Backend
- Express.js
- SQLite
- TypeScript
- Axios

## Docker (Future)

Docker configuration files are included for future deployment:
- `Dockerfile` - Base image setup
- `docker-compose.yml` - Multi-container orchestration

Currently, the application is designed for local development.

## Testing the OpenSAT Integration

When the backend starts, it automatically:
1. Fetches the OpenSAT dataset
2. Caches it in memory
3. Provides filtering endpoints

Check the `/api/cache-status` endpoint to verify the data is loaded.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request

## License

(Add your license here)

## Troubleshooting

### Backend won't start
- Ensure port 3001 is available
- Check NODE_ENV is set to 'development'
- Verify database directory exists or can be created

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check NEXT_PUBLIC_API_URL is correct
- Clear browser cache and reload

### Questions not loading
- Verify OpenSAT API is accessible
- Check backend logs for fetch errors
- Confirm `cache-status` endpoint returns `isCached: true`

## Contact & Support

For issues or questions, please open a GitHub issue.
