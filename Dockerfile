# Multi-stage Dockerfile for Next.js + Prisma app

# 1) Base deps stage
FROM node:20-alpine AS base

# Needed for prisma / native deps
RUN apk add --no-cache openssl

WORKDIR /app

# 2) Dependencies stage
FROM base AS deps

# Copy package manifests and Prisma schema (needed for prisma generate in postinstall)
COPY package.json package-lock.json* pnpm-lock.yaml* ./
COPY prisma ./prisma

# Install dependencies (prefers npm since package-lock.json exists)
RUN if [ -f package-lock.json ]; then \
      npm ci --legacy-peer-deps; \
    elif [ -f pnpm-lock.yaml ]; then \
      corepack enable && pnpm install --frozen-lockfile; \
    else \
      npm install --legacy-peer-deps; \
    fi

# 3) Build stage
FROM base AS builder

ENV NODE_ENV=production

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client and build Next.js app
RUN npx prisma generate && \
    npm run build

# 4) Production runtime
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy prisma schema (for migrations if needed at runtime)
COPY --from=builder /app/prisma ./prisma

# Copy production node_modules and build output
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# If you need to run migrations at container start, uncomment and adjust:
USER appuser

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
