FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json tsconfig.json knexfile.ts ./
RUN npm install

COPY src/ ./src/

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db ./src/db
COPY knexfile.ts ./

# Install ts-node for migrations in production
RUN npm install ts-node typescript @types/node

EXPOSE 3000

CMD ["sh", "-c", "npx knex migrate:latest --knexfile knexfile.ts && node dist/index.js"]
