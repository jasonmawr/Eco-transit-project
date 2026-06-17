# Notification and Share Architecture

## Notifications

P0 can implement in-app notifications/events first. FCM/web push can be P1.

### Notification events

| Event | Trigger | Recipient |
|---|---|---|
| ticket_received | Ticket upload accepted | User |
| ticket_verified | Ticket verified and points awarded | User |
| ticket_rejected | Ticket rejected | User |
| ticket_manual_review | Ticket needs review | User/admin queue optional |
| points_awarded | Ledger positive entry | User |
| voucher_redeemed | Voucher redeemed | User |
| voucher_expiring | Scheduled check | User |
| review_approved | UGC approved | User |
| review_rejected | UGC rejected | User |

## Share bill

### Share behavior

- Backend creates share URL and share text.
- Frontend detects `navigator.share` only in supported secure context.
- Copy link fallback always visible.
- Optional social share dialog can use URL.

### Public bill rendering

Public bill endpoint/page must respect `privacy_level`:

- masked: broad summary only.
- station_only: station/area names and summary metrics.
- full_public: only if user explicitly selected.

### Abuse controls

- Non-guessable slug.
- Optional expiration for guest bill.
- Basic rate limit on bill creation/share increment.
