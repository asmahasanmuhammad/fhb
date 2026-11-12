# ═════════════════════════════════════════════════════════════════
# Football Hub Bangladesh (FHB) — Production Dockerfile
# Optimized for Next.js 16 + SQLite Database
# ═════════════════════════════════════════════════════════════════

FROM oven/bun:1 AS base
WORKDIR /app

# 1. Dependencies
FROM base AS deps
COPY package.json bun.lock* ./
COPY prisma ./prisma/
RUN bun install --frozen-lockfile

# 2. Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN bun prisma generate
RUN bun run build

# 3. Production Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy application files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/db ./db

EXPOSE 3000

CMD ["bun", "run", "start"]
