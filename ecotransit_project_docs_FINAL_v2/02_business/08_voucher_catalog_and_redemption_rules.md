# Voucher Catalog and Redemption Rules

## Voucher states

`draft`, `active`, `paused`, `expired`, `sold_out`, `archived`.

## Redemption rules

1. User must be authenticated and active.
2. Voucher must be active, within validity window and have remaining quantity.
3. User must have sufficient available points.
4. Redemption must run in a DB transaction.
5. Points deduction and voucher_redemption creation must succeed or fail together.
6. Duplicate client retries must be safe through idempotency key.
7. Voucher codes must be encrypted at rest if pre-generated.
8. User sees redeemed code only after successful transaction.
9. Admin can pause voucher instantly; paused vouchers cannot be redeemed.
10. Refund/reversal is admin-only and must create a compensating points ledger entry, never mutate history.

## Admin voucher features

- Create/edit/pause/archive voucher.
- Import manual codes by CSV.
- Set cost, quantity, validity, partner name, category and display image.
- View redemption history.
- Export redemption report.

## User UI states

- Not enough points.
- Sold out.
- Expired.
- Login required.
- Already redeemed if per-user limit applies.
- Success with code and usage instruction.
