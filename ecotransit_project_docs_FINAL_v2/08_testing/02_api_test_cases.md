# API Test Cases

## Auth

- Login success.
- Login invalid credentials.
- Refresh success.
- Logout revokes session.
- Protected endpoint rejects guest.

## Ownership

- User A cannot read User B ticket.
- User A cannot read User B bill if private.
- Moderator can access moderation queue.
- User cannot access admin endpoints.

## Ticket

- Valid upload returns 202.
- Invalid MIME rejected.
- Oversized file rejected.
- Duplicate hash goes manual/rejected.
- Verified ticket awards points once.
- Re-run verify does not double award.

## Voucher

- Insufficient points rejected.
- Expired voucher rejected.
- Quantity zero rejected.
- Successful redeem creates negative ledger and redemption.

## Bill

- Create bill returns share URL/text.
- Public bill respects `station_only`.
- Guest temporary bill does not expose account data.

## Review

- Submitted review is pending.
- Public endpoint excludes pending/rejected.
- Moderator approve publishes review.
