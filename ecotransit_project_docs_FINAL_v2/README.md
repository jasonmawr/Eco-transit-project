# EcoTransit — Final Project Documentation Pack

EcoTransit is a modern mobile-first public-transit experience web app for HCMC. The product must not be a cheap clone of HCMC Metro or Go!Bus. It must use those systems as context and move beyond them with: bus + metro route planning, map-first UX, weather-aware recommendations, station/place guides, UGC reviews, articles/videos, ticket photo points, reward redemption, social “time bill”, moderation, privacy-by-design and production-grade delivery.

## Final source of truth

Read these in order before coding:

1. `AGENTS.md`
2. `QUICKSTART_FOR_AGENTS.md`
3. `00_overview/00_FINAL_EXECUTIVE_BRIEF.md`
4. `00_overview/03_hcmc_metro_benchmark_and_gap_analysis.md`
5. `00_overview/05_final_scope_lock_and_assumptions.md`
6. `01_product/01_PRD.md`
7. `01_product/06_complete_functional_requirements_matrix.md`
8. `02_business/03_ticket_points_rewards_rules.md`
9. `03_architecture/10_final_stack_lock.md`
10. `03_architecture/13_route_planning_weather_algorithm.md`
11. `03_architecture/14_points_ledger_algorithm.md`
12. `04_ux/09_hcmc_metro_better_than_benchmark.md`
13. `04_ux/10_premium_ui_art_direction.md`
14. `04_ux/11_screen_by_screen_final_specs.md`
15. `04_ux/15_taste_skill_final_operating_guide.md`
16. `07_agent/prompt_pack/00_MASTER_BUILD_PROMPT_FINAL.md`
17. `08_testing/06_traceability_matrix.md`
18. `09_delivery/03_acceptance_criteria.md`

## Final locked stack

- Frontend: Next.js + React + TypeScript, mobile-first, PWA-ready.
- Backend: Node.js + Express API in modular-monolith style.
- ORM: Prisma.
- Database: PostgreSQL.
- Cache/queue/rate limit: Redis + BullMQ.
- Map/routing/places/weather: Google Maps Platform adapters, with local seed fallback.
- Storage: Firebase Storage / GCS-compatible bucket.
- OCR: Google Cloud Vision adapter, dev stub allowed only behind explicit environment flag.
- Auth/session: backend-owned auth, HttpOnly Secure cookies, Google OAuth2-first plus email/password fallback, argon2id password hash.
- Rich content editor: TipTap for admin posts/guides.
- UI quality: Taste Skill required for all public-facing screens.

## Non-negotiables

- No token in localStorage.
- No public raw ticket image URL.
- No points without immutable ledger.
- No voucher redemption without transaction/idempotency guard.
- No public UGC before moderation approval.
- No exact home/work coordinate in shared bills by default.
- No generic AI-looking UI.
- No fake production readiness: tests, health checks, logs, backup, rollback and UAT are required.
