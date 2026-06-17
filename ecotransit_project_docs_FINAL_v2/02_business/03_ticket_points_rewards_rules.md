# Ticket, Points, and Rewards Rules

## Ticket states

| Status | Meaning | Points allowed? |
|---|---|---|
| uploaded | File accepted, record created | No |
| pending | Waiting for OCR/rule/manual processing | No |
| verified | Valid ticket/trip proof | Yes, once |
| rejected | Invalid, duplicate, abuse, or unreadable | No |
| manual_review | Needs moderator decision | No until approved |

## Ticket validation layers

1. Synchronous upload checks:
   - Allowed MIME: jpg/jpeg/png/webp.
   - Max size configurable.
   - Reject empty/corrupt files.
   - Random file name.
   - Strip EXIF where possible.
   - Compute exact hash and perceptual hash.

2. Async checks:
   - OCR text extraction.
   - Keyword/date/fare/station detection.
   - Duplicate hash/pHash check.
   - User daily quota check.
   - Confidence score.

3. Manual review:
   - Review low confidence.
   - Approve/reject with reason.
   - Audit decision.

## Points ledger rules

- Ledger is append-only except administrative correction with audit.
- Positive points source types: ticket, bonus, quiz, admin_adjust.
- Negative points source types: redeem, admin_adjust.
- Every ledger entry must store `balance_after`.
- Balance cache must be recalculable.
- Idempotency key required for award from ticket: `(source_type='ticket', source_id=ticket_id)` unique.

## Voucher rules

- Voucher status: draft, active, disabled, expired.
- Redemption type: manual_code, partner_api.
- MVP supports manual_code and CSV/import-style stock.
- Partner API is P1/P2 until contract exists.
