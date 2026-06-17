# Roadmap and Scope Control

> EcoTransit Project Docs v1.0 — generated for coding-agent handoff.
> Principle: production-grade, mobile-first, privacy-by-design, không xây trùng lõi vận hành của Go!Bus/HCMC Metro; EcoTransit là lớp trải nghiệm, nội dung, gamification và chia sẻ.


## Scope philosophy

Build a complete, production-grade P0/P1-lite. Do not build a fake demo that only works happy paths. Also do not build phase-2 complexity inside phase 1.

## P0 — Must ship

- Web app shell, mobile-first.
- Auth/session basics: email/password and/or Google OAuth depending selected stack.
- Guest route search bus + metro with weather-aware scoring.
- Station/stop detail page with guide/post/review placeholders and seeded content.
- Quiz submit/result.
- Ticket upload with secure storage and async/pseudo-async verification queue.
- Points ledger and points balance cache.
- Bill generation with share link/text and copy fallback.
- Admin/moderator queue for ticket and review moderation.
- Basic voucher manual redeem with quantity and points deduction.
- Observability basics: request_id, structured logs, health endpoints.
- Automated tests for key flows.

## P1 — Near-term after P0

- Push or in-app notification center.
- Voucher CSV import/export and expiration reminders.
- Better UGC media moderation.
- Rich text editor for guides/posts.
- More seed data and station-area content.
- Turnstile or equivalent anti-bot on abuse-prone flows.
- OpenGraph image generation for bill cards.

## P2 — Later

- Partner voucher API.
- Advanced anti-fraud and ticket aggregation.
- Route popularity analytics.
- Campus/group leaderboard.
- Carbon-saved card.
- Streaks/challenges.
- AR wayfinding.
- Personalized routing based on profile/mood.

## Suggested sprint plan

| Sprint | Goal | Main deliverables | Exit criteria |
|---|---|---|---|
| Sprint 0 | Foundation | Repo, stack, env, DB, design tokens, health | Build/test baseline pass |
| Sprint 1 | Discovery | Route search, map, weather scoring, station pages, quiz | Guest can plan route and complete quiz |
| Sprint 2 | Trust loop | Ticket upload, verification workflow, points ledger, admin queue | Upload leads to pending/verified/rejected/manual review |
| Sprint 3 | Social/reward | Bill share, voucher redeem, review submit/moderation | User can share bill and redeem a manual voucher |
| Sprint 4 | Hardening | Tests, accessibility, security, backup, deploy runbook | Regression, security checklist, UAT pass |

## Scope control rules for agent

- Every new feature must be tagged P0/P1/P2.
- P2 code must not be implemented unless the owner explicitly starts a P2 batch.
- P1 code can be scaffolded behind feature flags only when it does not slow P0.
- Unknown provider APIs must be represented by interfaces/adapters and mocks.
