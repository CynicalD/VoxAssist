# Optional container image for local smoke tests or DO Dockerfile-based deploys.
# Build:  docker build -f deploy/Dockerfile -t voxassist .
# Run:    docker run --rm -p 3000:3000 --env-file .env voxassist

FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Public Clerk key (and USE_MOCK_AI) can be baked at build via --build-arg if needed.
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
ARG USE_MOCK_AI=true
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV USE_MOCK_AI=$USE_MOCK_AI
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["npm", "start"]
