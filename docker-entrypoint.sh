#!/bin/bash
set -e

echo "*****"
echo "** Application preparing to start up... Hi!"
echo "** Local time         :$(date -Is)"
echo "** SERVICE_NAME       :${SERVICE_NAME}"
echo "** NODE_ENV           :${NODE_ENV}"
echo "*****"

if [ -d "/app" ]; then
  cd /app

  if [ "$RUN_MIGRATIONS" = "ENABLE" ]; then
    echo "+Running Prisma migrations - disable with .env entry RUN_MIGRATIONS=DISABLE"
    npx prisma migrate deploy
    echo "+Prisma migrations completed"
  else
    echo "+Skipping Prisma migrations - enable with .env entry RUN_MIGRATIONS=ENABLE"
  fi

  if [ "$GENERATE_PRISMA" = "ENABLE" ]; then
    echo "+Generating Prisma client - disable with .env entry GENERATE_PRISMA=DISABLE"
    npx prisma generate
    echo "+Prisma client generation completed"
  else
    echo "+Skipping Prisma client generation - enable with .env entry GENERATE_PRISMA=ENABLE"
  fi

  echo "+Application is ready to start"
fi

# If the first argument starts with a dash, it's a flag to the main command
if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ]; then
  set -- node "$@"
fi

exec "$@"
