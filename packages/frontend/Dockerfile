FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and configs
COPY package.json tsconfig.json next.config.js postcss.config.js tailwind.config.ts ./

# Install dependencies
RUN npm install --ignore-scripts

# Copy source and public
COPY src/ ./src/
COPY public/ ./public/

# Build args for Next.js
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_NAME=KoraPay

# Build Next.js
RUN npx next build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Railway sets PORT automatically
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

CMD ["node", "server.js"]
