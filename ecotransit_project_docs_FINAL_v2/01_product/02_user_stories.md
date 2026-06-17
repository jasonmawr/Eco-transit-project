# User Stories

## Guest user

### US-G01 Route search
As a guest, I want to enter a start and destination so that I can see a practical bus/metro route.

Acceptance:
- Origin/destination input supports typed place labels and/or map coordinates.
- Result shows route summary, ETA, walking minutes, transfer count, fare estimate if available.
- Result explains why the route is recommended.
- Error state explains if provider is unavailable.

### US-G02 Weather-aware route
As a guest, I want routes that consider rain or heat so that I do not walk too much in bad weather.

Acceptance:
- Weather context is shown in human language.
- During rain/heat, route scoring penalizes walking and transfers.
- User can still compare alternatives.

### US-G03 Station detail
As a guest, I want to view a station/stop page so that I know what is nearby and how to navigate around it.

Acceptance:
- Page shows station name, type, district/address, nearby routes, relevant guides/posts/reviews.
- Missing content uses friendly empty state.

### US-G04 Quiz
As a guest, I want to answer a short quiz so that I get a transit persona and suggestions.

Acceptance:
- Quiz can run without login.
- Result has score, transit state, and recommendations.
- Login prompt is optional for saving result.

## Registered user

### US-U01 Ticket upload
As a user, I want to upload a bus/metro ticket image so that my trip can be verified for points.

Acceptance:
- Only allowed image formats and sizes are accepted.
- User sees immediate pending state.
- Verification status can be viewed later.
- Invalid file returns friendly error.

### US-U02 Points history
As a user, I want to see my points ledger so that I trust my balance.

Acceptance:
- Balance is visible.
- Each ledger row shows source, delta, status, date, and friendly description.
- Balance cache must match latest ledger in tests.

### US-U03 Voucher redeem
As a user, I want to redeem a voucher with points so that my transit behavior has rewards.

Acceptance:
- User cannot redeem if points are insufficient.
- Quantity cannot go below zero.
- Points deduction and redemption are atomic.
- Voucher code is revealed only after successful redeem.

### US-U04 Bill sharing
As a user, I want to create a trip bill so that I can share my transit journey.

Acceptance:
- Default privacy is `station_only` or safer.
- Share URL and share text are always returned.
- Native share is used only when supported; copy fallback always exists.

### US-U05 Review submission
As a user, I want to submit a review/guide near a station so that others can discover useful places.

Acceptance:
- Submitted UGC is `pending` by default.
- User sees moderation status.
- Public pages only show approved content.

## Moderator/Admin

### US-M01 Ticket moderation
As a moderator, I want to review suspicious/low-confidence tickets so that rewards are not abused.

Acceptance:
- Queue supports filters by status/type/date/user.
- Moderator can approve, reject, or request manual review note.
- Decision creates audit log and may award points once.

### US-M02 Review moderation
As a moderator, I want to approve/reject UGC so that public content is safe.

Acceptance:
- Queue shows content, media preview, author, target station/place.
- Approve publishes content; reject stores reason.
- Every action is audited.

### US-A01 Voucher management
As an admin, I want to manage vouchers so that rewards can be launched without partner API.

Acceptance:
- Create/edit/disable voucher.
- Track quantity, valid dates, status.
- Codes are encrypted or protected at rest.
