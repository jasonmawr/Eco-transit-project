# AGENTS.md — Supreme Rules for Coding Agents

You are implementing EcoTransit as a production-grade web product, not a disposable demo.

## Operating principles

1. Audit first. Read the relevant docs before code.
2. Plan before code. Every batch must declare scope, non-scope, files, migration impact, test plan, rollback plan.
3. Implement in small reversible batches.
4. Use real domain language in Vietnamese. No raw enum/null/stack trace in user UI.
5. Build mobile-first. Desktop must be good, but phone UX is the primary acceptance surface.
6. Design must be premium and modern, not boilerplate.
7. Every business mutation must be authorized, audited where relevant, and covered by tests.
8. Keep adapters replaceable: map, weather, OCR, storage, voucher partner.
9. Prefer complete business invariants over shallow UI-only flows.
10. Never silently ignore failures from routing, weather, upload, OCR, points, voucher or moderation.

## Required quality bars

### Product
- Must meet feature parity with HCMC Metro baseline: route lookup, station map, nearby places, offers, news/content, language-ready public UI.
- Must exceed baseline with bus+metro planning, weather-aware recommendation, UGC review/guide, ticket-to-points, rewards, social time bill, moderation and privacy controls.

### UI/UX
- Apply `04_ux/15_taste_skill_final_operating_guide.md`.
- Submit screenshots for mobile 390px, tablet 768px, desktop 1440px for every user-facing screen.
- Fix overflow, poor spacing, low contrast, dead empty states, generic cards and inconsistent icons before declaring done.

### Backend
- Enforce role + resource ownership on all private resources.
- Use transactions for points and vouchers.
- Use idempotency keys for upload verification, points awarding, voucher redemption and share tracking where applicable.
- Log with request_id; no secrets or raw tokens in logs.

### Testing
- Unit tests for algorithms and rules.
- Integration tests for auth, route search, upload, verification, points, voucher, moderation, bill share.
- E2E tests for happy paths and critical edge paths.
- Security baseline for auth, CSRF, IDOR, upload, XSS and privacy.

## Final report format per batch

- Summary
- Scope delivered
- Files changed
- DB/migration impact
- Security/privacy impact
- UI screenshots captured
- Tests run and results
- Known risks or none
- Rollback plan
- Next recommended batch
