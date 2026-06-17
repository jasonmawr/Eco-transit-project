# Local Development Quickstart

## Prerequisites

- Node.js LTS.
- PostgreSQL.
- Redis optional but recommended.
- Object storage emulator or local storage adapter for dev.
- Provider API keys optional; mock adapters must work without external keys.

## Environment

Create `.env` files from `.env.example`:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

## Local commands

Example only; adapt to package manager:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
npm test
npm run test:e2e
```

## Required local behavior

- App can run with mock route/weather/OCR providers.
- External provider credentials are not required for basic development.
- Seed accounts can exercise user/moderator/admin flows.
