# Final Stack Lock

## Chosen architecture

EcoTransit uses a modular monolith with separate runtime artifacts:

- `apps/web`: Next.js + React + TypeScript.
- `apps/api`: Node.js + Express API.
- `apps/worker`: BullMQ worker for async jobs.
- `packages/shared`: shared DTOs/types/constants.
- `packages/db`: Prisma schema/client/migrations.
- `packages/ui`: reusable design-system components if useful.

## Locked technology choices

| Layer | Decision |
|---|---|
| Frontend | Next.js + React + TypeScript |
| UI styling | Tailwind CSS + CSS variables/design tokens; no random inline styling |
| UI skill | Taste Skill required for public screens |
| Backend | Node.js + Express |
| ORM | Prisma |
| DB | PostgreSQL |
| Cache/rate limit/queue | Redis + BullMQ |
| Object storage | Firebase Storage / GCS-compatible bucket |
| OCR | Google Cloud Vision adapter, dev stub only in non-prod |
| Map | Google Maps JavaScript API adapter |
| Routing | Google Routes API adapter + local seed fallback |
| Places | Google Places API adapter + local enrichment |
| Weather | Google Weather API adapter + cached snapshots |
| Auth | Express-owned session/auth, Google OAuth2 + email/password fallback |
| Password hashing | argon2id |
| Cookies | HttpOnly, Secure, SameSite=Lax/Strict according to deployment |
| Rich text | TipTap editor |
| Testing | Vitest/Jest equivalent, Supertest, Playwright, k6, ZAP/baseline security checklist |
| CI/CD | GitHub Actions |
| Hosting recommendation | Vercel for web + Cloud Run for API/worker or equivalent Docker-capable hosting |

## Adapter boundary

Every external provider must be behind an interface:

- `TransitRouteProvider`
- `MapProviderConfig`
- `WeatherProvider`
- `PlacesProvider`
- `OcrProvider`
- `StorageProvider`
- `VoucherPartnerProvider`
- `NotificationProvider`

Business logic cannot import provider SDKs directly.
