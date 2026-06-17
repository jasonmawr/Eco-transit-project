# Domain Model

## Core entities

| Entity | Purpose |
|---|---|
| User | Authenticated account and role |
| Session | Refresh/session token record |
| Station | Bus stop or metro station |
| Route | Transit route/line metadata |
| RouteStation | Many-to-many route-station order |
| RouteSearch | Optional persisted search metadata/snapshot |
| Ticket | Uploaded proof image and verification result |
| PointLedgerEntry | Append-only points mutation |
| Voucher | Reward catalog item |
| VoucherRedemption | User redemption record |
| Bill | Shareable route/trip summary |
| Review | User-submitted station/place review |
| Post | Admin/curated guide/article/video |
| MediaAsset | Stored media metadata |
| Notification | User notification/event |
| AuditLog | Admin/moderator/security audit event |
| Geofence | Configurable region boundary |

## Key invariants

- `User.points_balance_cache` equals sum of posted ledger entries unless recalculation is pending.
- `Ticket.verified` can generate exactly one positive ledger entry.
- `Voucher.quantity_remaining >= 0`.
- `VoucherRedemption` must link to a negative points ledger entry.
- `Bill.share_slug` is globally unique.
- `Review` is not public unless `moderation_status = approved`.
- `MediaAsset` original private files are not public direct URLs.
- `AuditLog` is append-only.
