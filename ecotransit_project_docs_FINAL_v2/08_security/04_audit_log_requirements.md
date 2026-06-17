# Audit Log Requirements

## Events to audit

- Login failures above threshold.
- Admin/moderator ticket decisions.
- Admin/moderator review decisions.
- Voucher create/update/disable.
- Voucher redemption failure/success if abuse-relevant.
- Points admin adjustment.
- Role/user status changes.
- Geofence/station seed changes.
- Security configuration changes.

## Audit fields

- id
- actor_id or system
- action
- target_type
- target_id
- previous value/status when relevant
- new value/status when relevant
- reason
- request_id
- created_at

## Redaction

Do not log secrets, raw tokens, full voucher codes before redemption, or full sensitive OCR payload unless strictly needed and access-controlled.
