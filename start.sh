#!/bin/bash

# ==============================================================================
# TaskFlow API - Quick Setup and Startup Script
# ==============================================================================

set -e

echo "=================================================="
echo "🚀 Setting up TaskFlow API..."
echo "=================================================="

# 1. Check & setup environment variables
if [ ! -f .env ]; then
  echo "📄 .env file not found. Creating from .env.example..."
  cp .env.example .env
else
  echo "✔ .env file exists."
fi

# 2. Check & install dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing npm dependencies..."
  npm install
else
  echo "✔ Dependencies already installed."
fi

# 3. Prisma generate & database push
echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🗄️ Syncing SQLite database schema..."
npx prisma db push

# 4. Database Seeding
echo "🌱 Seeding initial demo data..."
npm run db:seed

# 5. Summary Banner
echo ""
echo "=================================================="
echo "🎉 Setup completed successfully!"
echo "--------------------------------------------------"
echo "📍 API Server:        http://localhost:5000"
echo "📍 Health Check:       http://localhost:5000/health"
echo "🔑 Admin User:         admin@codzee-review.dev  (Password: Admin@123456)"
echo "🔑 Member User:        member@codzee-review.dev (Password: Member@123456)"
echo "=================================================="
echo "⚡ Starting development server (npm run dev)..."
echo ""

# 6. Start development server
exec npm run dev
