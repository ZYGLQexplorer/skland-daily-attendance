# Build stage
FROM node:24-alpine AS builder

# Install pnpm
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build step (optional if using tsx, but good for type checking)
RUN pnpm run build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Copy necessary files
COPY --from=builder /app /app

# Install production dependencies only (optional, can just use the builder state)
# RUN pnpm install --prod --frozen-lockfile

# Create data directories
RUN mkdir -p /app/.cache && mkdir -p /app/.data/kv

# Set environment variables
ENV NODE_ENV=production

# Start the application
# We use tsx to run main.ts directly to stay close to source and keep it simple
CMD ["npx", "tsx", "main.ts"]
