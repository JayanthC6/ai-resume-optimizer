# AI Resume Optimizer (HiredLens)

AI Resume Optimizer is a full-stack monorepo for ATS-focused resume optimization.
It lets users upload a PDF resume, compare it against a target job description, and get AI-powered outputs such as:

- ATS and role match scoring
- Keyword gap analysis
- Resume rewrites and regeneration
- Skill-gap roadmap (30/60/90 days)
- Interview question sets with STAR guidance
- GitHub portfolio-to-resume bullet suggestions

## Live Link: https://ai-resume-optimizer-1-z3xt.onrender.com

## Monorepo Architecture

This repository uses npm workspaces + Turbo.

- apps/api: NestJS backend (auth, resume parsing, analysis pipeline)
- apps/web: React + Vite frontend dashboard
- packages/types: shared TypeScript contracts used by API and web
- packages/database: shared Prisma client exports and schema

## Tech Stack

### Frontend

- React 19
- Vite 8
- TypeScript
- Tailwind CSS
- Zustand
- Axios
- React Router

### Backend

- NestJS 11
- TypeScript
- Prisma
- PostgreSQL (with pgvector image)
- Redis
- JWT auth (passport-jwt)
- pdf2json for PDF text extraction
- Google Gemini API (@google/generative-ai)

### Tooling

- Turbo (task orchestration)
- npm workspaces
- ESLint + Prettier

## Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- npm 10+
- Docker Desktop (for Postgres + Redis)

## Quick Start

### 1) Install dependencies

~~~bash
npm install
~~~

### 2) Start infrastructure (Postgres + Redis)

~~~bash
docker compose up -d
~~~

### 3) Configure environment variables

A root .env file is used by the backend (loaded from ../../.env relative to apps/api).

Use this template:

~~~env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:15432/ai_resume_db?schema=public"

# Redis
REDIS_URL="redis://localhost:16379"

# API & Security
PORT=8000
JWT_SECRET="replace_with_a_long_random_secret"
AUTH_EXPIRATION="7d"

# AI
GOOGLE_API_KEY="your_google_api_key"
GOOGLE_GEMINI_MODEL="models/gemini-2.5-flash"
GOOGLE_GEMINI_FALLBACK_MODELS="models/gemini-2.0-flash,models/gemini-1.5-flash"

# Frontend Integration
FRONTEND_URL="http://localhost:5173"

# Email (SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="smtp_user"
SMTP_PASS="smtp_password"
SMTP_FROM="HiredLens <no-reply@yourdomain.com>"
~~~

Important:

- Keep secrets out of source control.
- If you accidentally committed a real API key, rotate it immediately.

### 4) Generate Prisma client and run migrations

From repository root:

~~~bash
npx prisma generate --schema packages/database/prisma/schema.prisma
npx prisma migrate dev --schema packages/database/prisma/schema.prisma
~~~

### 5) Start all apps in development

~~~bash
npm run dev
~~~

Default local URLs:

- Web: http://localhost:5173
- API: http://localhost:8000

## Running Services Individually

From repository root:

~~~bash
npm run dev --workspace api
npm run dev --workspace web
~~~

## Available Scripts

### Root scripts

~~~bash
npm run dev      # turbo run dev
npm run build    # turbo run build
npm run lint     # turbo run lint
npm run format   # prettier --write
~~~

### API scripts

~~~bash
npm run dev --workspace api
npm run build --workspace api
npm run test --workspace api
npm run test:e2e --workspace api
npm run test:cov --workspace api
~~~

### Web scripts

~~~bash
npm run dev --workspace web
npm run build --workspace web
npm run lint --workspace web
npm run preview --workspace web
~~~

## API Overview

Base URL (local):

- http://localhost:8000

### Authentication

- POST /auth/register
  - body: email, password (min 6), fullName
  - response: accessToken, user
- POST /auth/login
  - body: email, password
  - response: accessToken, user

### Resume

- POST /resume/upload (JWT required)
  - multipart form-data with file field named file (PDF)
  - response: resumeId, status

### Analysis (all require JWT)

- POST /analysis/run
  - body: resumeId, jobTitle, companyName?, jobDescription
- POST /analysis/regenerate
  - body: resumeId, jobTitle, companyName?, jobDescription
- POST /analysis/roadmap
  - body: resumeId, jobTitle, companyName?, jobDescription
- POST /analysis/interview-questions
  - body: resumeId, jobTitle, companyName?, jobDescription
- POST /analysis/github-analyzer
  - body: resumeId, jobTitle, companyName?, jobDescription, githubProfileUrl
- GET /analysis/templates/list
- GET /analysis/team/overview?teamName=Career%20Cohort
- GET /analysis/:id

## Data Model (Prisma)

Core entities:

- User
- Resume
- Analysis

High-level relationships:

- A User has many Resumes
- A Resume has many Analyses

Prisma schema location:

- packages/database/prisma/schema.prisma

## Frontend Notes

- API client base URL is controlled by VITE_API_URL and falls back to http://localhost:8000.
- JWT token is stored via Zustand and attached to outgoing API requests.

Recommended frontend .env (apps/web/.env):

~~~env
VITE_API_URL="http://localhost:8000"
~~~

## Docker Services

docker-compose.yml starts:

- postgres: pgvector/pgvector:pg16 on localhost:15432
- redis: redis:7-alpine on localhost:16379

## Typical Local Development Workflow

1. Start Docker services.
2. Ensure .env has valid secrets and Gemini model.
3. Run Prisma generate + migrate.
4. Start monorepo dev servers with npm run dev.
5. Register a user in the UI.
6. Upload a resume PDF and run analysis.

## Troubleshooting

### API cannot be reached from web

- Confirm backend is running on port 8000.
- Confirm frontend uses VITE_API_URL=http://localhost:8000.
- Restart web dev server after changing frontend env vars.

### Prisma migration/client issues

- Re-run:

~~~bash
npx prisma generate --schema packages/database/prisma/schema.prisma
npx prisma migrate dev --schema packages/database/prisma/schema.prisma
~~~

- Verify Postgres container is healthy and running.

### AI analysis fails

- Check GOOGLE_API_KEY is valid.
- Check GOOGLE_GEMINI_MODEL is set to a model available in your account.
- Optionally set GOOGLE_GEMINI_FALLBACK_MODELS (comma-separated) so the app can fail over during temporary model overload.
- Confirm outbound network access to Google API.

### JWT/auth issues

- Ensure JWT_SECRET is set and stable across restarts in development.
- Re-login if tokens were issued before secret changes.

## Security Notes

- Never commit live API keys or production secrets.
- Rotate credentials immediately if exposed.
- Restrict CORS origins before production deployment.

## Production Readiness Checklist

- Replace permissive CORS settings with allowlist.
- Add robust request validation and rate limiting.
- Move analysis execution to background jobs/queues.
- Add centralized logging and monitoring.
- Harden secret management and CI/CD deployment config.

## License 
#Docker run command(docker compose up --build -d  )

No license file is currently defined in this repository.
Add a LICENSE file before public distribution.
