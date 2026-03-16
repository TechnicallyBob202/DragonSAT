#!/bin/sh
set -e

# Ensure the database directory exists before starting the backend.
# This is a safety net for environments where the volume isn't mounted
# or where Node.js lacks the permissions to create it at runtime.
mkdir -p /app/data

node /app/backend/dist/server.js &
BACKEND_PID=$!

# Explicitly set PORT=3000 so Next.js doesn't inherit PORT=3001 from
# the environment (which docker-compose sets for the backend).
cd /app/frontend && PORT=3000 ./node_modules/.bin/next start &
FRONTEND_PID=$!

wait $BACKEND_PID $FRONTEND_PID
