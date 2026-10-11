# AI Resume Optimizer (HiredLens)

AI Resume Optimizer (HiredLens) is an end-to-end, full-stack AI career intelligence platform and ATS optimization engine built as an npm monorepo with Turbo. It enables candidates to upload resumes, optimize them against specific or multiple job descriptions, generate tailored outreach communications, prepare for reverse interviews, and track career upskilling roadmaps with automated weekly email reminders.

## Live Demo: [https://ai-resume-optimizer-1-z3xt.onrender.com](https://ai-resume-optimizer-1-z3xt.onrender.com)

---

## Key Features

### 1. ATS Scoring & Resume Optimization
- **ATS & Match Scoring**: Instant role compatibility and ATS scoring breakdown with gap analysis.
- **Keyword Intelligence**: Identified matched and missing hard/soft skills categorized by importance.
- **Smart Rewrites & Bullet Improvements**: AI-suggested summary rewrites, action verb upgrades, and quantified achievement bullets.
- **Resume Regeneration**: Generate an upgraded, clean Markdown resume ready for export.

### 2. Market Gap Analysis (Multi-Job Comparison)
- **Multi-JD Comparison**: Evaluate your resume against up to 5 target job descriptions simultaneously.
- **Fit Rankings**: Ranked job matches with percentage scores and role alignment insights.
- **Common & Critical Gaps**: Aggregated view of shared missing keywords and high-priority skills to learn first.

### 3. Questions to Ask the Interviewer (Reverse Questions)
- **Targeted Reverse Questions**: Curated questions for the candidate to ask interviewers, grouped into four core pillars:
  - **Team Dynamics**
  - **Role Success & Expectations**
  - **Growth & Learning**
  - **Company Culture**
- **Contextual Reasoning**: Each question includes a specific explanation tied to the candidate's resume and job requirements.
- **Redis Caching**: Cached based on analysis input hash and user credentials to eliminate redundant AI calls.

### 4. Cover Letter & Outreach Generator
- **Multi-Format Drafts**: Generate targeted outreach in seconds:
  - **Cover Letters**
  - **Recruiter InMail Messages**
  - **Follow-up Emails**
- **Customizable Tones & Lengths**: Professional, friendly, or confident; short, medium, or long.
- **Strict Traceability**: Grounded exclusively in verified resume facts without fabricating experience.
- **Clear Placeholders**: Automatic standardized placeholders (`[Company Name]`, `[Hiring Manager]`, `[Your Phone/LinkedIn]`).
- **Draft Management**: Save, edit, copy, and delete drafts; rate-limited at 10 generations per user/day via Redis.

### 5. Plan Tracker & Automated Weekly Reminders
- **Roadmap Synchronization**: Syncs the 30/60/90-day skill gap roadmap into interactive trackable tasks (`PlanTask`).
- **Interactive Checklists**: Filter tasks by phase, mark tasks completed, track phase completion percentages, and build consecutive-day streak counters.
- **BullMQ Scheduled Job**: Background daily queue processor (`04:00 UTC`) running on Redis to evaluate users with open tasks.
- **Resilient Email Check-ins**:
  - Delivers a weekly summary of remaining open tasks, progress, and streaks.
  - Enforces a 6-day cooldown between emails per user.
  - Integrates with **Resend** via native HTTP API.
  - **Zero-Failure Mode**: If `RESEND_API_KEY` is not provided, dispatches are logged locally in mock mode without crashing the service or queue.

### 6. Interactive Mock Interview & GitHub Analyzer
- **Interactive Technical Arena**: Behavioral, technical, and mixed interview sessions with live grading and STAR framework reports.
- **GitHub Portfolio Alignment**: Analyzes public GitHub repositories to extract relevant technical contributions and translate them into resume-ready bullet points.

### 7. User Home Hub & Persistent State
- **Home Dashboard (`/home`)**: Dedicated landing hub featuring suggested next actions, feature cards, and recent analyses.
- **Deep Linking**: Full query parameter routing (`?tab=...` and `?analysisId=...`) across all dashboard tabs.
- **Persistent Auth**: Client-side Zustand session persistence with automatic token rehydration across page reloads (F5).

---

## Monorepo Architecture

```
ai-resume-optimizer/
├── apps/
│   ├── api/          # NestJS 11 backend (Auth, AI, Analysis, Outreach, Plan Tracker)
│   └── web/          # React 19 + Vite 8 frontend SPA
├── packages/
│   ├── database/     # Prisma ORM schema, migrations, and database client
│   └── types/        # Shared TypeScript interfaces and DTO definitions
├── docker-compose.yml# Multi-container orchestration (Postgres, Redis, API, Web)
└── turbo.json        # Turbo task pipeline configuration
```

---

## Tech Stack

### Frontend (`apps/web`)
- **React 19** & **Vite 8**
- **TypeScript**
- **Tailwind CSS** with `lucide-react` icons & `@radix-ui` primitives
- **Zustand** (with `persist` middleware for session state)
- **React Router 7** (with protected route guards and query param deep linking)
- **Axios** (with Bearer token request interceptor and 401 redirect handling)

### Backend (`apps/api`)
- **NestJS 11**
- **Prisma ORM** with **PostgreSQL** (`pgvector`)
- **Redis** & **ioredis** (caching and rate limiting)
- **BullMQ 5** (reliable background job queues and schedulers)
- **Google Gemini API** (`@google/generative-ai`) with automatic multi-model fallback and backoff resilience
- **Passport JWT** & **bcryptjs** (secure authentication)
- **Resend HTTP API** (native `fetch` email delivery)
- **pdf2json** (streamlined PDF resume text extraction)

---

## Database Schema (Prisma)

The application database is structured across the following relational models:

| Model | Description |
| :--- | :--- |
| **`User`** | User account credentials, email, subscription status, and relationships. |
| **`Resume`** | Uploaded PDF metadata, S3 storage keys, parsed text, and structured JSON. |
| **`Analysis`** | Individual job analysis containing ATS scores, keyword gaps, and rewrites. |
| **`InterviewSession`** | Mock interview practice session state, mode, language, and report scores. |
| **`InterviewMessage`** | Message history within a mock interview session. |
| **`JobTarget`** | Multi-job target comparison data, fit rankings, and priority skills. |
| **`ReverseQuestionSet`** | Generated questions to ask interviewers mapped to specific analyses. |
| **`Draft`** | Saved outreach messages, cover letters, and follow-up emails. |
| **`PlanTask`** | Interactive task items (goals & mini projects) for the 30/60/90 day roadmap. |
| **`PlanReminderSetting`** | User email reminder preferences (`enabled`, `frequency`, `lastSentAt`). |

---

## Getting Started

### Prerequisites
- **Node.js**: `20.x` or higher
- **npm**: `10.x` or higher
- **Docker Desktop**: Running locally for Postgres and Redis

---

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/JayanthC6/ai-resume-optimizer.git
cd ai-resume-optimizer
npm install
```

### 2. Start Infrastructure via Docker

Start PostgreSQL and Redis:

```bash
docker compose up -d postgres redis
```

### 3. Configure Environment Variables

Create a `.env` file in the repository root (or copy `.env.example`):

```bash
cp .env.example .env
```

Ensure the following variables are configured:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:15432/ai_resume_db?schema=public"

# Redis
REDIS_URL="redis://localhost:16379"

# API & Security
PORT=8000
JWT_SECRET="replace_with_a_long_random_secret"
AUTH_EXPIRATION="7d"

# AI Configuration (Gemini)
GOOGLE_API_KEY="your_gemini_api_key"
GOOGLE_GEMINI_MODEL="models/gemini-flash-latest"
GOOGLE_GEMINI_FALLBACK_MODELS="models/gemini-2.0-flash,models/gemini-2.5-flash"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=""
VITE_GOOGLE_CLIENT_ID=""

# Frontend Integration
FRONTEND_URL="http://localhost:5173"
VITE_API_URL="http://localhost:8000"

# Email Notifications (Optional - Resend)
RESEND_API_KEY=""
EMAIL_FROM="HiredLens <onboarding@resend.dev>"
```

### 4. Apply Database Migrations

Generate the Prisma Client and deploy migrations:

```bash
npx prisma generate --schema packages/database/prisma/schema.prisma
npx prisma migrate deploy --schema packages/database/prisma/schema.prisma
```

### 5. Run Development Servers

Start both the backend API and frontend client concurrently:

```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)

---

## Full Docker Deployment

You can run the entire application stack (Postgres, Redis, API, Web) with a single command:

```bash
docker compose up --build -d
```

---

## API Reference

### Authentication (`/auth`)
- `POST /auth/register` — Create a new account (`email`, `password`, `fullName`).
- `POST /auth/login` — Sign in and obtain JWT access token.
- `POST /auth/google-login` — Sign in using Google OAuth ID token.
- `POST /auth/forgot-password` — Request password reset email.
- `POST /auth/reset-password` — Reset password using token.

### Resume Management (`/resume`)
- `POST /resume/upload` — Upload a PDF resume (`multipart/form-data`).

### Core Analysis (`/analysis`)
- `POST /analysis/run` — Run comprehensive ATS match and gap analysis.
- `POST /analysis/regenerate` — Regenerate an optimized Markdown resume.
- `POST /analysis/roadmap` — Generate 30/60/90-day upskilling roadmap.
- `POST /analysis/interview-questions` — Generate interview practice questions with STAR answers.
- `POST /analysis/github-analyzer` — Extract resume bullets from a GitHub profile.
- `GET /analysis/history` — List past analyses for the authenticated user.
- `GET /analysis/:id` — Retrieve full analysis details by ID.
- `POST /analysis/:id/reverse-questions` — Generate and save questions to ask interviewers.
- `GET /analysis/:id/reverse-questions` — Fetch saved questions to ask interviewers.

### Market Gap Analysis (`/job-market`)
- `POST /job-market/compare` — Compare resume against multiple target job descriptions.
- `GET /job-market/:resumeId` — Retrieve saved market gap targets and rankings.

### Outreach & Drafts (`/outreach`)
- `POST /outreach/generate` — Generate cover letters, InMails, or follow-up drafts.
- `GET /outreach` — List saved drafts (optional `?analysisId=...` filter).
- `PATCH /outreach/:id` — Update draft title or content.
- `DELETE /outreach/:id` — Delete a saved draft.

### Plan Tracker & Reminders (`/plan-tracker`)
- `POST /plan-tracker/sync/:analysisId` — Sync roadmap goals and mini-projects into trackable tasks.
- `GET /plan-tracker/:analysisId` — Fetch tasks grouped by phase with completion statistics.
- `PATCH /plan-tracker/tasks/:id` — Update task status (`todo`, `in_progress`, `done`).
- `GET /plan-tracker/streak` — Retrieve consecutive completion day streak count.
- `GET /plan-tracker/reminders` — Get weekly email reminder settings.
- `PATCH /plan-tracker/reminders` — Toggle weekly email reminders on/off.
- `POST /plan-tracker/reminders/test-trigger` — Trigger an immediate test reminder job (dev/non-production only).

---

## Available Scripts

### Root Workspace
- `npm run dev` — Starts all workspaces in watch mode via Turbo.
- `npm run build` — Builds all packages and applications.
- `npm run lint` — Runs ESLint across the codebase.
- `npm run format` — Formats files with Prettier.

### Service-Specific
- `npm run dev --workspace api` — Runs only the NestJS API.
- `npm run dev --workspace web` — Runs only the React frontend.
- `npm run build --workspace api` — Builds the NestJS API.
- `npm run build --workspace web` — Builds the Vite production bundle.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
