#!/bin/sh
# Railway start helper for frontend service
# Set this as Custom Start Command in Railway UI:
#   sh scripts/start-frontend.sh
cd packages/frontend && npx next start -H 0.0.0.0 -p ${PORT:-3000}
