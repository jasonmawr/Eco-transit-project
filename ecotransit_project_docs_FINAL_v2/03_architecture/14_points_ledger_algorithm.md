# Points Ledger Algorithm

## Principles

1. Points are financial-like records and must be append-only.
2. Never update old point entries to change balance.
3. Every award/redeem/reversal is a new ledger row.
4. `users.points_balance_cache` is derived/cache; ledger is source of truth.
5. Ticket points are awarded only after verified status.

## Ledger fields

- id
- user_id
- source_type: ticket, redeem, bonus, admin_adjust, reversal, quiz
- source_id
- delta
- balance_after
- status
- idempotency_key
- created_at
- created_by nullable

## Ticket award flow

1. Verification job decides ticket is valid.
2. Open DB transaction.
3. Lock user points row or use serializable transaction.
4. Check no existing successful points entry for `source_type=ticket` and `source_id=ticket_id`.
5. Calculate delta using ticket type/rules/quota.
6. Insert ledger entry.
7. Update user balance cache.
8. Mark ticket `verified` and `points_awarded_at`.
9. Commit.
10. Send notification after commit.

## Redemption flow

1. Validate voucher active/inventory/expiry.
2. Validate user balance.
3. Open transaction.
4. Lock voucher inventory and user balance.
5. Insert negative points ledger row.
6. Create voucher_redemption.
7. Decrement inventory.
8. Commit.
9. Show code and notification.

## Anti-abuse limits

- Configurable max verified tickets/day/user.
- Duplicate hash/pHash rejection or manual review.
- Same trip time/station repeated too often enters manual review.
- Admin adjustment requires reason and audit log.
