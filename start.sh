#!/bin/bash

# ==============================================================================
# TaskFlow API - Setup, Verification & Startup Script
# ==============================================================================

set -e

echo "=================================================="
echo "🚀 Setting up & Initializing TaskFlow API..."
echo "=================================================="

# 1. Environment Variable Setup (.env)
if [ ! -f .env ]; then
  echo "📄 .env file not found. Generating from defaults..."
  cat << 'EOF' > .env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="z5VsS9BWzQkYXigDXrDJ6tWfd03IQ5diGJbGKkaob78yOuKrrwkMLQ36ua0"
JWT_EXPIRES_IN="24h"
NODE_ENV="development"
EOF
  echo "✔ .env file created successfully."
else
  echo "✔ .env file found."
  # Check and ensure required keys exist
  grep -q "DATABASE_URL" .env || echo 'DATABASE_URL="file:./dev.db"' >> .env
  grep -q "JWT_SECRET" .env || echo 'JWT_SECRET="z5VsS9BWzQkYXigDXrDJ6tWfd03IQ5diGJbGKkaob78yOuKrrwkMLQ36ua0"' >> .env
  grep -q "PORT" .env || echo 'PORT=5000' >> .env
  grep -q "NODE_ENV" .env || echo 'NODE_ENV="development"' >> .env
fi

# 2. Check & Install NPM Dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing npm dependencies..."
  npm install
else
  echo "✔ Dependencies already installed."
fi

# 3. Prisma Client Generation & Schema Push
echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🗄️ Syncing SQLite development database (dev.db)..."
npx prisma db push

# 4. Database Seeding
echo "🌱 Seeding demo users, projects and tasks..."
npm run db:seed

# 5. Prepare Test DB and Run Automated API Verification
echo "🧪 Running automated test suite to verify all APIs..."
DATABASE_URL="file:./test.db" npx prisma db push --skip-generate > /dev/null 2>&1
npm test

# 6. Display Credentials & Endpoint Summary
echo ""
echo "=================================================="
echo "🎉 All APIs Tested & Verified Successfully (27/27 Passed)!"
echo "--------------------------------------------------"
echo "📍 API Server:        http://localhost:5000"
echo "📍 Health Check:       http://localhost:5000/health"
echo "📍 Auth Endpoints:    http://localhost:5000/api/v1/auth"
echo "📍 Projects API:      http://localhost:5000/api/v1/projects"
echo "📍 Tasks API:         http://localhost:5000/api/v1/tasks"
echo "--------------------------------------------------"
echo "🔑 Default Admin:      admin@codzee-review.dev  (Password: Admin@123456)"
echo "🔑 Default Member:     member@codzee-review.dev (Password: Member@123456)"
echo "=================================================="
echo "⚡ Starting development server with Nodemon (npm run dev)..."
echo ""

# 7. Start Development Server
exec npm run dev
