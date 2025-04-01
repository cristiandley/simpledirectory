FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install build dependencies for SQLite
RUN apk add --no-cache --virtual .build-deps python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci
RUN npm install sqlite3 --save

# Remove build dependencies
RUN apk del .build-deps

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# SQLite needs these shared libraries
RUN apk add --no-cache sqlite

COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create a directory for the SQLite database
RUN mkdir -p /app/data
VOLUME /app/data

EXPOSE 3001

CMD ["npm", "run", "start:prod"]