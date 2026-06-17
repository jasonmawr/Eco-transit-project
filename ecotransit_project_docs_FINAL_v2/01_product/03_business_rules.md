# Business Rules

## Route search

- Route search can be used by guests.
- Weather-aware scoring is an EcoTransit recommendation layer, not an official travel guarantee.
- Route result must store snapshot when later used for bill generation.
- External provider failures must return graceful fallback/error, not blank screen.

## Ticket verification and points

- Upload creates ticket in `uploaded` or `pending` state.
- Points are awarded only when `verification_status = verified`.
- A ticket can award points once only.
- Duplicate image hash or perceptual hash should prevent automatic points.
- Low-confidence OCR or suspicious duplicate goes to `manual_review`.
- Rejected tickets must store reason.
- Daily per-user ticket reward quota must be configurable.
- Points balance cache is derived from ledger and may be recalculated.

## Voucher redemption

- Redemption must be atomic: points deduction, voucher quantity update, and redemption record succeed or fail together.
- `quantity_remaining` cannot become negative.
- Expired/inactive vouchers cannot be redeemed.
- Users cannot redeem the same one-time voucher campaign more than allowed by policy.
- Voucher codes must not be exposed in API lists before redemption.

## Bill sharing

- Default privacy is `station_only`.
- Public bill must not include exact home/work coordinates.
- Share slug must be random and non-guessable.
- Guest bill can be temporary; persistent bill requires user account.
- Share API must always return copyable `share_url` and `share_text`.

## UGC review/guide

- User-submitted UGC is `pending` by default.
- Public pages show only `approved` UGC.
- Moderators/admins can approve/reject with reason.
- Abusive content can be hidden/removed without deleting audit trail.
- Media follows the same storage safety rules as ticket images.

## Admin/moderation

- Moderator can manage tickets and reviews.
- Admin can manage vouchers, content, station seeds, geofence config, and users if implemented.
- Every moderation/admin action must create audit log with actor, target, action, timestamp, and relevant payload.
