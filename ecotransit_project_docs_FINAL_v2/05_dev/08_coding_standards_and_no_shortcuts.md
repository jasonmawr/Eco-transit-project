# Coding Standards and No-Shortcut Rules

## No-shortcut rules

- Do not fake business success by frontend-only state.
- Do not store auth tokens in localStorage.
- Do not publicize raw ticket images.
- Do not award points without ledger transaction.
- Do not redeem voucher without inventory/points transaction.
- Do not publish UGC without moderation.
- Do not hard-code API keys, station IDs or geofence in UI.
- Do not leave provider failures as uncaught exceptions.
- Do not return raw enum values to users.

## Backend conventions

- Controllers thin; services own business logic.
- Adapters isolate providers.
- DTOs typed and validated.
- Use transactions for multi-row business operations.
- Use request_id in logs and response meta.
- Tests accompany critical rules.

## Frontend conventions

- Components small and purposeful.
- Long business logic in hooks/services, not JSX.
- Loading/error/empty states first-class.
- Use design tokens.
- Mobile layout implemented before desktop expansion.
- Every form has validation and accessible labels.

## Database conventions

- Migrations committed.
- Foreign keys and indexes for ownership/status/date queries.
- Soft delete/archive where business history matters.
- Audit logs immutable.
- `created_at` and `updated_at` consistently used.
