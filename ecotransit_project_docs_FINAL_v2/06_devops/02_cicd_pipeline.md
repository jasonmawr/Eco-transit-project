# CI/CD Pipeline

## Pull request pipeline

1. Install dependencies.
2. Type-check.
3. Lint.
4. Unit tests.
5. Integration tests with test DB.
6. Build web/API.
7. Secret leakage scan.
8. Optional Playwright smoke.

## Staging pipeline

1. Deploy staging.
2. Run migrations.
3. Seed staging if appropriate.
4. Run smoke tests:
   - health endpoints.
   - login.
   - route search mock/provider.
   - ticket upload mock.
   - bill create/share.
   - admin moderation page loads.

## Production pipeline

1. Manual approval.
2. Backup/snapshot.
3. Run migrations.
4. Deploy API.
5. Deploy worker/functions.
6. Deploy web.
7. Post-deploy smoke.
8. Rollback if smoke fails.

## No-ship conditions

- Tests fail.
- Migrations fail.
- Secret scan fails.
- Security checklist fails for touched area.
- UI quality gate fails for touched screens.
