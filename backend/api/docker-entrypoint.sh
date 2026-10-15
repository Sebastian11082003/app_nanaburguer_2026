#!/bin/sh
set -e

# Schema first, then optional seed. Seed is idempotent but it must not
# plant the documented local password on a public host — seed.cjs
# refuses that unless ALLOW_INSECURE_DEFAULTS=true.
npx prisma migrate deploy

if [ "${SEED_ON_BOOT:-true}" = "true" ]; then
  npx prisma db seed
fi

exec node dist/main
