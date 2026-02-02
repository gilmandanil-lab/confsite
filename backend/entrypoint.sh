#!/bin/sh
set -e

# Wait for postgres to be ready
echo "Waiting for postgres to be ready..."
max_attempts=30
attempt=1

until [ $attempt -gt $max_attempts ]; do
  if PGPASSWORD=confsite psql -h postgres -U confsite -d confsite -c '\q' 2>/dev/null; then
    echo "Postgres is up"
    break
  fi
  echo "Postgres is unavailable (attempt $attempt/$max_attempts) - sleeping"
  sleep 2
  attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
  echo "Failed to connect to Postgres after $max_attempts attempts"
  exit 1
fi

echo "Running migrations..."

# Run migrations
cd /app
goose -dir ./migrations postgres "$DB_DSN" up

echo "Migrations completed - starting API..."

# Start the API
exec /app/api
