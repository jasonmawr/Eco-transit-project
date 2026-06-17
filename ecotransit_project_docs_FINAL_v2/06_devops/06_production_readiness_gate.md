# Production Readiness Gate

## Required before production

- `.env.example` complete.
- Secrets not committed.
- Health/readiness endpoints live.
- DB migrations tested on clean database.
- Seed command documented.
- Backup command documented and restore tested.
- CI runs lint/type/test/build.
- Smoke tests after deploy.
- Error tracking configured.
- Logs include request_id.
- Rate limiting enabled for login/upload/review/redeem.
- HTTPS/cookie settings verified.
- Storage bucket private by default.
- Admin account creation/rotation documented.
- Rollback plan tested.

## Health endpoint checks

`/healthz` basic liveness.

`/readyz` checks:

- DB connection.
- Redis connection.
- Storage signed URL capability.
- Queue status.
- Provider configuration presence.

## Release blocker examples

- Public ticket images.
- Points inconsistencies.
- Voucher double redemption.
- Admin/moderator can access unauthorized resources.
- Mobile route planner broken.
- Missing backup/restore procedure.
