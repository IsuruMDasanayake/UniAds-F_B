#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Generate app key if it's not set in .env or environment
if ! grep -q "APP_KEY=base64:" .env && [ -z "$APP_KEY" ]; then
    echo "Generating app key..."
    php artisan key:generate --force
fi

# Create storage link if it doesn't exist
if [ ! -d public/storage ]; then
    echo "Creating storage link..."
    php artisan storage:link
fi

# Wait for database connection
echo "Waiting for database..."
until php artisan db:monitor; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

# Run Migrations
echo "Running migrations..."
php artisan migrate --force || true

# Run Mail Template Seeder
echo "Seeding Mail Templates..."
php artisan db:seed --class=MailTemplateSeeder --force || true

# Execute the specified command if provided, otherwise start PHP-FPM
if [ $# -gt 0 ]; then
    echo "Executing command: $@"
    exec "$@"
else
    echo "Starting PHP-FPM..."
    exec php-fpm
fi
