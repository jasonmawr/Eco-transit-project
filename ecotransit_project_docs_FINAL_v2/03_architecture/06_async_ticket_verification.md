# Async Ticket Verification Architecture

## Goal

Ticket upload must be fast. Verification can take time and must not block the upload request.

## Flow

```text
POST /tickets/upload
→ validate file
→ store private object
→ create ticket(status=uploaded/pending)
→ enqueue VerifyTicket job
→ return 202

VerifyTicket job
→ load ticket + file
→ OCR extract
→ compute/update hashes if needed
→ run rules
→ decide: verified / rejected / manual_review
→ if verified: award points idempotently
→ create notification/event
→ audit decision
```

## Rule engine inputs

- OCR text.
- OCR confidence.
- ticket_type.
- trip_date.
- station hints.
- exact image hash.
- perceptual hash.
- user daily quota.
- previous tickets for user.
- global duplicate signals.

## Decision policy

| Condition | Decision |
|---|---|
| High confidence + not duplicate + quota ok | verified |
| Invalid file/OCR impossible/clearly unrelated | rejected |
| Duplicate exact hash | rejected or manual_review depending policy |
| Similar pHash | manual_review |
| Low confidence but plausible | manual_review |
| Daily quota exceeded | rejected or manual_review with reason |

## Idempotency

- Verify job may run more than once.
- Points award must be protected by unique `(source_type, source_id)` or transaction lock.
- Re-running verified ticket must not double-award points.

## Manual review

Moderator decision endpoint must:

- Check moderator/admin role.
- Lock ticket row.
- Check current status allows transition.
- Update status/reason.
- Award points if approve and not previously awarded.
- Audit action.
