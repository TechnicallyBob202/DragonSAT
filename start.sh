#!/bin/sh
set -e

node /app/backend/dist/server.js &
BACKEND_PID=$!

cd /app/frontend && ./node_modules/.bin/next start &
FRONTEND_PID=$!

wait $BACKEND_PID $FRONTEND_PID
