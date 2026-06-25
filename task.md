# EcoTransit Mail Integration & Diagnostics Task Tracker

## P0.1 — Compile Fixes
- [x] Remove unused cooldown test variables in `apps/api/src/test/epic10.test.ts`
- [x] Verify API builds correctly with clean environment checks

## P0.2 — Safe SMTP Diagnostics & Cooldown Audit
- [x] Audit frontend `AuthModal.tsx` resend cooldown activation logic
- [x] Fix cooldown UI bug: restrict timer triggering strictly to HTTP 429 status code, avoiding false countdowns on 503 failures
- [x] Design safe backend SMTP error diagnostics mapping connection, timeout, auth, TLS/SSL, and address errors

## P0.3 — Error Obfuscation & Nested Recursion
- [x] Implement cycle-safe recursive error classifier (depth limit 5) to inspect `.cause` and `AggregateError.errors`
- [x] Suppress raw developer error messages and stack traces in production/demo server logs
- [x] Retain user-friendly public HTTP 503 Vietnamese copy

## P0.4 — Brevo HTTPS Transporter Integration
- [x] Add `MAIL_PROVIDER` selection model supporting `smtp` (default) and `brevo_http`
- [x] Implement native `fetch` client to Brevo HTTPS API with 10s AbortController timeout
- [x] Map Brevo specific responses (401/403 -> `AUTH_REJECTED`, timeouts, etc.) into unified diagnostics
- [x] Mock network layer in unit tests to verify Brevo HTTPS failure paths and success responses
- [x] Keep SMTP transporter fallback backward compatible

## Verification & Deployment
- [x] Verify local monorepo builds cleanly (`npm run build`)
- [x] Run backend Vitest suite (all integration/unit tests pass)
- [x] Run Playwright E2E browser tests (all 18 specs pass)
- [x] Synchronize working tree and push to `main` for Render/Vercel auto-deploys
