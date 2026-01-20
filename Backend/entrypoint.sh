#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Generate app key if it's not set
if [ -z "$APP_KEY" ]; then
    echo "Generating app key..."
    php artisan key:generate --force
fi

# Create storage link if it doesn't exist
if [ ! -L public/storage ]; then
    echo "Creating storage link..."
    php artisan storage:link
fi

# Wait for database connection
echo "Waiting for database..."
until php artisan db:monitor; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Path to the php-fpm executable
echo "Starting PHP-FPM..."
exec php-fpm
