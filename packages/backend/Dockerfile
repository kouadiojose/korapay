FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json tsconfig.json ./

# Install all deps (including devDependencies for build)
RUN npm install --ignore-scripts

# Copy source
COPY src/ ./src/

# Build TypeScript
RUN npx tsc

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package file and install production deps only
COPY package.json knexfile.js ./
RUN npm install --production --ignore-scripts

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Railway sets PORT automatically
ENV PORT=3000
EXPOSE 3000

# Start: try migrations (don't fail if DB not ready), then start server
CMD ["sh", "-c", "npx knex migrate:latest --knexfile knexfile.js --env production 2>&1 || echo 'Migration skipped'; node dist/index.js"]
