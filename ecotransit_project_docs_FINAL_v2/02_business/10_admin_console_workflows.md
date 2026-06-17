# Admin Console Workflows

## Admin modules

1. Dashboard.
2. Ticket moderation.
3. Review/guide moderation.
4. Content CMS.
5. Station and route seed data.
6. Nearby places/POIs.
7. Voucher and redemption management.
8. Users and roles.
9. Notifications.
10. Audit logs.
11. System settings/geofence/providers.
12. Reports/exports.

## Required admin permissions

| Permission | Admin | Moderator |
|---|---:|---:|
| View dashboard | Yes | Yes |
| Moderate tickets | Yes | Yes |
| Moderate reviews | Yes | Yes |
| Manage content | Yes | Limited |
| Manage vouchers | Yes | No |
| Manage users | Yes | No |
| Manage settings | Yes | No |
| View audit logs | Yes | Limited own moderation events |
| Export reports | Yes | No |

## Audit required actions

- Login failures over threshold.
- Role changes.
- Ticket approve/reject.
- Points adjustment/reversal.
- Voucher create/update/pause/import/redeem/reverse.
- Review approve/reject.
- Content publish/archive.
- Provider/settings changes.
- Data exports.

## Acceptance

Admin console is not accepted if moderation is done only through database/manual scripts. All P0 moderation and content operations must be available in UI.
