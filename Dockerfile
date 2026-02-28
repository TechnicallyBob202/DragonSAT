# Multi-stage build for DragonSAT

# Build backend
FROM node:20-alpine AS backend-builder
RUN apk add --no-cache python3 make g++
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend ./
RUN npm run build
RUN npm prune --production

# Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
ARG NEXT_PUBLIC_API_URL=/api/proxy
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build
RUN npm prune --production

# Production stage
FROM node:20-alpine
RUN apk add --no-cache sqlite
WORKDIR /app

# Copy backend (compiled code + pruned node_modules — sqlite3 already compiled)
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules

# Copy frontend (built app + pruned node_modules)
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules

# Startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Runtime env — BACKEND_URL is server-side only (no NEXT_PUBLIC_)
ENV BACKEND_URL=http://localhost:3001/api
ENV NODE_ENV=production

# Only expose the public-facing port; 3001 stays internal
EXPOSE 3000
CMD ["sh", "/app/start.sh"]
