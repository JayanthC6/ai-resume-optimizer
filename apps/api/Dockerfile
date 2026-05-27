# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Prisma's native query-engine binary requires OpenSSL on Alpine
RUN apk add --no-cache openssl

# Copy root workspace manifests
COPY package.json package-lock.json turbo.json ./

# Copy package manifests for ALL workspace members (must match lockfile)
COPY packages/types/package.json ./packages/types/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install all dependencies (needed for workspace linking)
RUN npm ci --legacy-peer-deps

# Copy all source code
COPY packages/types/ ./packages/types/
COPY packages/database/ ./packages/database/
COPY apps/api/ ./apps/api/

# Generate Prisma client using the locally installed prisma (avoids downloading v7)
RUN cd packages/database && ../../node_modules/.bin/prisma generate

# Build the API
RUN cd apps/api && npx nest build

# ─── Stage 2: Production Image ────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Prisma's native query-engine binary requires OpenSSL on Alpine
RUN apk add --no-cache openssl

# Copy root workspace manifests
COPY package.json package-lock.json turbo.json ./

# Copy package manifests for ALL workspace members (must match lockfile)
COPY packages/types/package.json ./packages/types/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install only production dependencies
RUN npm ci --legacy-peer-deps --omit=dev

# Copy compiled API output from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copy Prisma schema and generated client
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy package sources needed at runtime
COPY packages/types/ ./packages/types/
COPY packages/database/ ./packages/database/

EXPOSE 3000

# Use the locally installed prisma binary (v5 from packages/database) — NOT npx which would download v7
CMD ["sh", "-c", "cd packages/database && ../../node_modules/.bin/prisma migrate deploy && cd /app && node apps/api/dist/main.js"]

