# Stage 1 - build
FROM node:18-alpine AS builder
WORKDIR /app

# copy package files and install ALL deps (dev + prod) so we can compile
COPY package*.json ./
RUN npm ci

# copy sources and build
COPY . .
RUN npm run build

# Stage 2 - runtime
FROM node:18-alpine AS runtime
WORKDIR /app

# copy built files and node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
# keep uploads folder (created at runtime)
RUN mkdir -p /app/uploads

EXPOSE 4000

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

# Start the app
CMD ["node", "dist/server.js"]
