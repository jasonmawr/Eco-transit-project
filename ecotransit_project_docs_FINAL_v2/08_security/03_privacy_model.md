# Privacy Model

## Personal data categories

| Data | Sensitivity | Rule |
|---|---|---|
| Email | Personal | Auth only, not public |
| Ticket image | Sensitive-ish travel proof | Private, limited access |
| Route search | Potentially sensitive location | Guest/no account by default; minimize storage |
| Bill | Potentially sensitive travel pattern | Mask by default |
| Reviews | Public UGC after moderation | Display name only, no email |
| Voucher redeem | Account/reward data | Private |

## Deletion/hiding

- User content can be hidden/deleted per policy.
- Audit logs may retain minimal metadata for abuse/security.
- Public bill should be disable-able if implemented.

## Public sharing

Never default to exact coordinates or full travel history.
