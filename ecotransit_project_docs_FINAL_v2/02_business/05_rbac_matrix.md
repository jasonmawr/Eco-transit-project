# RBAC Matrix

| Capability | Guest | User | Moderator | Admin |
|---|---:|---:|---:|---:|
| Search routes | ✅ | ✅ | ✅ | ✅ |
| View public station/post/review content | ✅ | ✅ | ✅ | ✅ |
| Submit quiz without saving | ✅ | ✅ | ✅ | ✅ |
| Save quiz result | ❌ | ✅ | ✅ | ✅ |
| Upload ticket | ❌ | ✅ | ✅ | ✅ |
| View own ticket status | ❌ | Own | Own + moderation scope | All |
| View points ledger | ❌ | Own | Own | All/limited admin view |
| Redeem voucher | ❌ | ✅ | ✅ | ✅ |
| Submit review/guide | ❌ | ✅ | ✅ | ✅ |
| Moderate tickets | ❌ | ❌ | ✅ | ✅ |
| Moderate reviews | ❌ | ❌ | ✅ | ✅ |
| Manage vouchers | ❌ | ❌ | ❌/optional | ✅ |
| Manage station/geofence seeds | ❌ | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | Limited | ✅ |
| Manage roles/users | ❌ | ❌ | ❌ | ✅ |

## Ownership rules

- Users can read/update only their own private resources.
- Moderator access is scoped to moderation resources, not arbitrary account takeover.
- Admin actions must still be audited.
- `user_id` from request body must never be trusted for ownership; derive from authenticated session.
