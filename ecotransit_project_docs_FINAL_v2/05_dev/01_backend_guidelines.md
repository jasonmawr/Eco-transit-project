# Backend Guidelines

## Module structure

Use clear feature modules:

```text
src/
  modules/
    auth/
    users/
    routes/
    weather/
    stations/
    tickets/
    points/
    vouchers/
    bills/
    reviews/
    posts/
    notifications/
    admin/
    audit/
  shared/
    db/
    config/
    errors/
    logging/
    security/
    adapters/
```

## Rules

- Controllers validate input and call services.
- Services enforce business rules.
- Repositories own DB access.
- Adapters own external provider calls.
- Domain errors map to stable API error codes.
- Use transactions for points/voucher/ticket state transitions.
- Use idempotency keys for upload/award/redeem flows.
- Avoid leaking provider-specific payloads to frontend unless normalized.

## Error handling

- Always include request_id.
- User-facing message in Vietnamese.
- Machine error code in English/UPPER_SNAKE.
- No stack traces in production response.

## Security

- Auth middleware attaches authenticated user.
- Role middleware checks role.
- Ownership middleware or service checks resource ownership.
- Never trust `user_id` from client for own resources.
- Rate-limit auth/upload/review/redeem.
