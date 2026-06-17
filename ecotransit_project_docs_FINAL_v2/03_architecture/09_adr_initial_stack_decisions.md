# ADR-0001 — Initial Stack Decisions

## Status

Proposed. Must be confirmed by project owner/tech lead before code.

## Context

EcoTransit is a consumer web app with route search, ticket upload, points/rewards, bill sharing, UGC, and admin moderation. Scale target is modest, but production quality, privacy, and UI polish matter.

## Decision

Recommended stack:

- Frontend: Next.js + React + TypeScript.
- Backend: Node.js + Express or Next.js BFF/API depending team preference.
- Database: PostgreSQL.
- ORM: Prisma or Drizzle. Choose one before migration generation.
- Cache/rate-limit: Redis.
- Storage: Firebase Storage/GCS or S3-compatible provider.
- Async verification: Cloud Functions or worker + queue. Prefer the simplest deploy path that team can operate.
- CI: GitHub Actions.
- Hosting: Vercel frontend + Cloud Run backend, or full Docker self-host if required.

## Consequences

- Modular monolith avoids microservice complexity.
- Adapter pattern reduces provider lock-in.
- Redis can be optional in earliest local development but must be planned for route cache/rate-limit.
- Cloud/function worker can be replaced by worker container later if queue requirements grow.

## Open decisions

- Prisma vs Drizzle.
- Cloud Functions vs worker container.
- Firebase/GCS vs S3-compatible storage.
- Google OAuth vs email/password-first.
- Initial deployment platform.
