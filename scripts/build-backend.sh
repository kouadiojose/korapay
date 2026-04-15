#!/bin/sh
# Railway build helper for backend service
# Set this as Custom Build Command in Railway UI:
#   sh scripts/build-backend.sh
cd packages/backend && npm install && npx tsc
