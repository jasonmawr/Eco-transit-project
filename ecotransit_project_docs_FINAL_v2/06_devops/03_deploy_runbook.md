# Deploy Runbook

## Pre-deploy

- Confirm release tag.
- Confirm migrations reviewed.
- Confirm backup completed.
- Confirm env variables present.
- Confirm external provider keys valid.
- Confirm rollback target.

## Deploy steps

Generic sequence:

```bash
# 1. build
npm run build

# 2. run tests
npm test
npm run test:e2e:smoke

# 3. deploy staging/prod via selected platform
# 4. run migrations
# 5. run smoke tests
```

## Smoke tests

- `/healthz` returns OK.
- `/readyz` returns OK or clear degraded status.
- Web home loads.
- Login works.
- Route search returns result or controlled provider error.
- Ticket upload accepts mock file.
- Bill create returns share URL.
- Admin queue loads for moderator/admin.

## Rollback

Rollback must define:

- App artifact rollback.
- DB migration rollback or forward-fix plan.
- Worker/function rollback.
- Feature flag disable if available.
