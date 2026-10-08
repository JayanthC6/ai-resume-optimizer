# HiredLens Backend Guide

## 1. Modules Architecture
- Built with NestJS. Follows a modular monolith pattern.
- Core Modules: `AuthModule`, `PrismaModule`, `AiModule`, `ResumeModule`, `AnalysisModule`, `InterviewModule`.
- New features should be encapsulated in their own domains (e.g., `JobMarketModule`, `OutreachModule`, `PlanTrackerModule`).

## 2. Prisma Conventions
- Additive migrations only (no dropping/renaming).
- Models use UUIDs as primary keys (`String @id @default(uuid())`).
- Relationships use standard foreign keys (`userId String`, `user User @relation(...)`).
- Heavy reliance on `Json` columns for AI output structures to allow flexible schema iteration without constant DB migrations.

## 3. Gemini & Redis Services
- **AiModule**: Contains `AiService` wrapper for Google Gemini. Handles rate limits, transient errors, fallback models, and JSON parsing. 
- All AI prompts enforce a strict JSON output schema and parse the response.
- **Redis**: Intended for caching and BullMQ queues.

## 4. Auth & Security
- Managed by `AuthModule`.
- `JwtAuthGuard` is used to protect routes. Controllers should use `@UseGuards(JwtAuthGuard)` and extract the user object.
- DTOs validated via `class-validator` and `class-transformer`.
