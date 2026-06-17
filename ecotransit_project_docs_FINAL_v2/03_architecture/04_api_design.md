# API Design

## Envelope

All JSON responses should follow:

```json
{
  "data": {},
  "meta": {
    "request_id": "req_...",
    "timestamp": "2026-07-06T10:00:00+07:00"
  },
  "error": null
}
```

Error:

```json
{
  "data": null,
  "meta": { "request_id": "req_..." },
  "error": {
    "code": "TICKET_DUPLICATE",
    "message": "Ảnh vé đã được sử dụng hoặc trùng lặp.",
    "details": {}
  }
}
```

## Core endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Guest | Login email/password |
| POST | `/api/v1/auth/oauth/google` | Guest | Exchange Google OAuth code |
| POST | `/api/v1/auth/refresh` | Refresh cookie | Refresh session |
| POST | `/api/v1/auth/logout` | User | Revoke session |
| GET | `/api/v1/me` | User | Profile and current points |
| POST | `/api/v1/routes/search` | Guest | Search route + weather-aware score |
| GET | `/api/v1/stations/:id` | Guest | Station detail and nearby content |
| GET | `/api/v1/posts` | Guest | Public posts/guides/videos |
| POST | `/api/v1/tickets/upload` | User | Upload ticket image |
| GET | `/api/v1/tickets` | User | Own ticket list |
| GET | `/api/v1/tickets/:id` | User/Moderator/Admin | Ticket detail with ownership/scope |
| GET | `/api/v1/points/ledger` | User | Own point history |
| GET | `/api/v1/vouchers` | User | Available vouchers |
| POST | `/api/v1/vouchers/:id/redeem` | User | Redeem voucher |
| POST | `/api/v1/bills` | Guest/User | Create bill |
| GET | `/api/v1/bills/:shareSlug` | Guest | Public bill detail respecting privacy |
| POST | `/api/v1/bills/:id/share` | User or slug token | Record share event |
| GET | `/api/v1/reviews` | Guest | Approved reviews by station/place |
| POST | `/api/v1/reviews` | User | Submit review/guide |
| POST | `/api/v1/quizzes/submit` | Guest/User | Submit quiz and get result |
| GET | `/api/v1/admin/moderation/tickets` | Moderator/Admin | Ticket queue |
| POST | `/api/v1/admin/moderation/tickets/:id/decision` | Moderator/Admin | Approve/reject/manual note |
| GET | `/api/v1/admin/moderation/reviews` | Moderator/Admin | Review queue |
| POST | `/api/v1/admin/moderation/reviews/:id/decision` | Moderator/Admin | Approve/reject/hide |
| POST | `/api/v1/admin/vouchers` | Admin | Create voucher |
| PATCH | `/api/v1/admin/vouchers/:id` | Admin | Update voucher |
| GET | `/healthz` | Public/internal | Liveness |
| GET | `/readyz` | Public/internal | Readiness |

## Request examples

### Route search

```json
{
  "origin": { "lat": 10.77567, "lng": 106.70042, "label": "Bến Bạch Đằng" },
  "destination": { "lat": 10.77191, "lng": 106.69831, "label": "Bến Thành" },
  "departure_time": "2026-07-10T08:00:00+07:00",
  "preferences": {
    "weather_aware": true,
    "prefer_less_walking": true,
    "prefer_fewer_transfers": true
  }
}
```

### Ticket upload response

```json
{
  "data": {
    "ticket_id": "tkt_001",
    "status": "uploaded",
    "verification_status": "pending",
    "message": "Ảnh vé đã được nhận. Hệ thống sẽ xác minh bất đồng bộ."
  },
  "meta": { "request_id": "req_ticket_01" },
  "error": null
}
```

## API design rules

- Use friendly Vietnamese messages.
- Use stable machine error codes.
- Do not leak raw stack traces.
- Do not expose raw provider errors to users.
- Use pagination for list endpoints.
- Use idempotency key for upload/award/redeem where necessary.
- Use server-side authenticated user, never `user_id` from client for own operations.
