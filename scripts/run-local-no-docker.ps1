# PowerShell script to run EcoTransit locally without Docker using Neon PostgreSQL

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Starting EcoTransit Local Setup (No-Docker) with Neon" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

# 1. Verify .env file exists
if (-not (Test-Path ".env")) {
    Write-Error "File .env khong ton tai. Vui long copy tu .env.local.example va cap nhat URL Neon PostgreSQL cua ban."
    exit 1
}

# 2. Install dependencies
Write-Host "`n[1/5] Installing dependencies..." -ForegroundColor Cyan
npm install

# 3. Synchronize database schema with Neon
Write-Host "`n[2/5] Pushing database schema to Neon PostgreSQL..." -ForegroundColor Cyan
npm run db:push

# 4. Reset database & seed presentation dataset
Write-Host "`n[3/5] Seeding database with presentation datasets..." -ForegroundColor Cyan
npm run demo:reset

# 5. Run automated integration test suite
Write-Host "`n[4/5] Running Vitest API integration test suite..." -ForegroundColor Cyan
npm run test

# 6. Boot development servers
Write-Host "`n[5/5] Launching Next.js frontend (3000) and Express API backend (3001)..." -ForegroundColor Cyan
npm run dev
