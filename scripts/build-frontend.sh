#!/bin/sh
# Railway build helper for frontend service
# Set this as Custom Build Command in Railway UI:
#   sh scripts/build-frontend.sh
cd packages/frontend && npm install && npx next build
