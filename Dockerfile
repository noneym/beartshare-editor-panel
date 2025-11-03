# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Build the application (client + server)
# Build client with vite
RUN npx vite build

# Build server with esbuild, excluding vite files
RUN npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist \
  --external:./vite.js \
  --external:./server/vite.ts \
  --external:../vite.config.ts

# Production stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy shared schema (needed at runtime)
COPY --from=builder /app/shared ./shared

# Copy server helper files (needed at runtime in production)
COPY --from=builder /app/server/static.ts ./server/static.ts
COPY --from=builder /app/server/logger.ts ./server/logger.ts

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
