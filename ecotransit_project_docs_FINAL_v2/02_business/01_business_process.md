# Business Process

## Guest discovery flow

```text
Open app
→ Enter origin/destination
→ Route adapter returns candidate routes
→ Weather adapter returns current/forecast context
→ EcoTransit scoring ranks route options
→ User views recommendation and station/guide content
→ Optional: create temporary bill or log in to save
```

## Ticket-to-points flow

```text
User logs in
→ Uploads ticket image + minimal metadata
→ Backend validates file
→ Storage stores original/private file
→ Ticket record created as pending/uploaded
→ Async job extracts OCR + hashes + rule score
→ If high confidence and not duplicate: verified
→ Points ledger entry is created exactly once
→ Balance cache updates
→ User notification/event created
→ If low confidence/suspicious: manual_review
→ Moderator approves/rejects
```

## Voucher redemption flow

```text
User chooses voucher
→ Backend checks auth, status, date, quantity, balance
→ Transaction locks user/ledger/voucher rows
→ Create negative points ledger
→ Create voucher_redemption
→ Decrement quantity
→ Return redeemed voucher details
```

## Bill share flow

```text
User selects route result/snapshot
→ Creates bill with privacy level
→ Backend stores route/weather snapshot and share slug
→ Frontend renders card
→ If Web Share supported: native share
→ Else: copy link / Meta share dialog
→ POST share event increments share_count
```

## UGC moderation flow

```text
User submits review/guide
→ Content saved as pending
→ Moderator reviews content/media
→ Approve publishes content
→ Reject stores reason and keeps audit trail
```
