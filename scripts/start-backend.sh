#!/bin/sh
# Railway start helper for backend service
# Set this as Custom Start Command in Railway UI:
#   sh scripts/start-backend.sh
# Migrations now run automatically inside Node.js at startup (src/index.ts)
cd packages/backend && node dist/index.js
