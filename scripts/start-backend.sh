#!/bin/sh
# Railway start helper for backend service
# Set this as Custom Start Command in Railway UI:
#   sh scripts/start-backend.sh
cd packages/backend && (npx knex migrate:latest --knexfile knexfile.js --env production 2>&1 || true) && node dist/index.js
