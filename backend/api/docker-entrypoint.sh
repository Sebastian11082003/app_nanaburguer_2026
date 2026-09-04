#!/bin/sh
set -e

# Apply schema, then seed the platform admin if missing.
# Seed is idempotent: a restart must not fail or duplicate the admin.
npx prisma migrate deploy
npx prisma db seed

exec node dist/main
