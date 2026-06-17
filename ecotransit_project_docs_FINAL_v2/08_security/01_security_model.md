# Security Model

## Threat model focus

EcoTransit handles:

- Email/account identity.
- Session/refresh tokens.
- Ticket images.
- Travel route/bill snapshots.
- User-generated reviews/media.
- Points/voucher value.
- Admin/moderation decisions.

## Core controls

| Risk | Control |
|---|---|
| Broken auth | Secure session, refresh rotation, password hashing, logout/revoke |
| IDOR/BOLA | Role + ownership checks on every resource-by-id endpoint |
| Upload malware/abuse | MIME/extension/size validation, private storage, random names, no execution |
| Token theft | No localStorage token, HttpOnly Secure cookies preferred |
| CSRF | SameSite cookies and CSRF token if needed |
| XSS | Escape user content, sanitize rich text, CSP where practical |
| UGC abuse | Pending moderation, reject/hide workflow, audit |
| Points fraud | Idempotency, duplicate checks, quotas, ledger |
| Voucher abuse | Atomic redeem transaction, quantity locks, status/date checks |
| Privacy leak | Default masked/station_only bill, no exact public coordinates |
