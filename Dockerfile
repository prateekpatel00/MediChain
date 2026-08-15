# ============================================================
# MediChain Next.js Web App — Multi-Stage Production Dockerfile
# ============================================================
# Stage 1: Build Dependencies & Next.js Bundle
# Stage 2: Minimal Production Runtime
# ============================================================

# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package manifests and install dependencies
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code and build app
COPY frontend/ .

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]
