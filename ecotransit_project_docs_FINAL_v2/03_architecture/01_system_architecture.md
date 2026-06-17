# System Architecture

> EcoTransit Project Docs v1.0 — generated for coding-agent handoff.
> Principle: production-grade, mobile-first, privacy-by-design, không xây trùng lõi vận hành của Go!Bus/HCMC Metro; EcoTransit là lớp trải nghiệm, nội dung, gamification và chia sẻ.


## Architecture style

Recommended architecture: modular monolith with separated frontend and backend runtimes.

Do not choose microservices for MVP. The product size and timeline do not justify distributed service complexity. However, module boundaries must be strong enough to allow future extraction of worker/provider modules.

## High-level diagram

```text
Mobile/Desktop Browser
        |
        v
Frontend Client: Next.js + React + TypeScript
- Landing / route search / map / station / quiz / bill / reviews / guides
- Auth UI / profile / points / ticket upload
- Admin moderation UI
- Web Share API + copy fallback
        |
        | HTTPS REST/JSON + multipart upload
        v
Backend API: Node.js + Express or Next.js API/BFF
Modules:
- Auth & Session
- Transit Planner
- Weather Adapter
- Places/Station Adapter
- Ticket Upload Orchestrator
- OCR/Verification Orchestrator
- Points Ledger
- Voucher Redemption
- Bills & Share
- Reviews/Posts/Guides
- Quiz Engine
- Notifications
- Admin/Moderation
        |
        +--> PostgreSQL: users, tickets, points, vouchers, bills, reviews, posts, routes, stations
        +--> Redis: route cache, rate-limit, optional queue/session cache
        +--> Object Storage: tickets/, ugc/, bill-assets/
        +--> Async Worker/Cloud Functions: OCR, rules, points award, notifications
        +--> External Providers: Maps/Routes/Places/Weather, FCM, voucher partner later
```

## Module boundaries

| Module | Owns | Must not own |
|---|---|---|
| Auth | users, sessions, auth provider mapping | points/vouchers business logic |
| Transit Planner | route request, provider adapter, scoring, cache | bill persistence |
| Weather Adapter | weather provider calls, cache | route DB schema |
| Stations/Places | local station data, provider place refs, nearby enrichment | user reviews moderation decisions |
| Tickets | upload, ticket status, verification orchestration | direct points cache mutation without ledger |
| Points | ledger, balance cache, idempotent award/deduct | voucher inventory rules alone |
| Vouchers | voucher catalog, redemption transactions | external partner assumptions without adapter |
| Bills | route/weather snapshots, share slug, privacy | exact raw GPS public exposure |
| Reviews/Posts | content and moderation statuses | auth roles |
| Admin | moderation queues, admin actions | bypassing lower module invariants |
| Notifications | event templates and delivery | source-of-truth state changes |

## Adapter pattern

All external systems must be wrapped:

```text
IRouteProvider
IWeatherProvider
IPlacesProvider
IStorageProvider
IOcrProvider
INotificationProvider
IVoucherPartnerProvider
```

Each adapter must support:

- Timeout.
- Friendly error mapping.
- Request logging with request_id but no secrets.
- Mock implementation for tests.
- Provider-specific mapping isolated from domain models.
