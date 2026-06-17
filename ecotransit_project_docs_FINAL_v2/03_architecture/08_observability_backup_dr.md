# Observability, Backup, and DR

## Observability minimum

| Layer | What to collect |
|---|---|
| API logs | request_id, method, route, status, duration, user_id_hash, error code |
| Frontend errors | route render errors, upload/share/map failures |
| Business metrics | route_search_count, ticket_upload_count, verify_success_rate, manual_review_rate, bill_share_rate, voucher_redeem_rate |
| Queue metrics | verify job lag, failure count, retry count |
| Security metrics | failed login, rate-limit hit, invalid upload, IDOR deny |

## Health endpoints

- `/healthz`: process alive.
- `/readyz`: DB reachable, storage config present, required env present, optional providers status.

## Logging rules

- No raw tokens.
- No API keys.
- No full ticket OCR text in general logs unless redacted and scoped to debug/admin.
- Hash or omit IP/user-agent details depending privacy policy.

## Backup

| Asset | Backup strategy | Frequency |
|---|---|---|
| PostgreSQL | managed snapshot + pg_dump export | nightly + before release |
| Object storage | lifecycle/retention or bucket copy | nightly/retention |
| Secrets | secret manager + encrypted export | when changed |
| Source code | Git tags/releases | continuous |
| Migrations | versioned in repo | every schema change |

## Restore test

At least once before production release:

1. Restore DB to staging.
2. Verify migrations apply.
3. Verify ticket metadata and media references.
4. Verify admin login and moderation queue.
5. Run smoke tests.
