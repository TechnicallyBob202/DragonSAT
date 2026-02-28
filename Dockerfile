# Multi-stage build for DragonSAT

# Build backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend ./
RUN npm run build

# Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
ARG NEXT_PUBLIC_API_URL=/api/proxy
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
RUN npm run build

# Production stage
FROM node:20-alpine
RUN apk add --no-cache sqlite
WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy frontend
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
RUN cd frontend && npm ci --only=production

# Startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Runtime env — BACKEND_URL is server-side only (no NEXT_PUBLIC_)
ENV BACKEND_URL=http://localhost:3001/api
ENV NODE_ENV=production

# Only expose the public-facing port; 3001 stays internal
EXPOSE 3000
CMD ["sh", "/app/start.sh"]
