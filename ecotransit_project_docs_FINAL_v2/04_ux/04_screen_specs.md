# Screen Specifications

## 1. Landing / Route entry

Required sections:
- Hero with clear one-line value proposition.
- Route search box above the fold.
- Weather-aware benefit.
- How points/rewards work.
- Station guide preview.
- Bill sharing preview.
- Safety/privacy note.

Hero rules:
- Must fit first viewport on mobile.
- Primary CTA: "Tìm đường ngay".
- Secondary CTA: "Làm quiz đi công cộng".

## 2. Route search screen

Layout mobile:

```text
Top: origin/destination input
Middle: map preview or compact route map
Bottom: result cards as bottom sheet
```

Each route card:
- ETA minutes.
- Walking minutes.
- Transfers.
- Weather score/reason.
- Fare estimate.
- Route leg timeline.
- CTA: "Chọn tuyến này" / "Tạo bill".

States:
- Loading skeleton.
- No route found.
- Provider degraded.
- Permission denied for location.

## 3. Station detail

Components:
- Station header: name/type/district/address.
- Quick info: routes, amenities, nearest exits if available.
- Weather note around station.
- Guides/posts.
- Approved reviews.
- Submit review CTA for logged-in user.

## 4. Quiz

Components:
- 5-8 friendly questions.
- Progress indicator.
- Result card with persona, score, recommendations.
- CTA to route search.

## 5. Ticket upload

Components:
- Upload drop/tap area.
- Ticket type selector.
- Optional trip date/station hints.
- Privacy notice.
- Status after upload.

States:
- Uploading.
- Accepted/pending.
- Invalid file.
- Too large.
- Duplicate/suspicious.

## 6. Points/vouchers

Components:
- Balance card.
- Ledger list/table.
- Voucher cards with cost, availability, expiry.
- Redeem confirmation.
- Success modal with code/instructions.

## 7. Bill composer/share

Components:
- Route snapshot summary.
- Privacy level selector, default `station_only`.
- Bill preview card.
- Native share button when supported.
- Copy link fallback.

## 8. Admin ticket moderation

Components:
- Queue filters.
- Ticket preview and OCR text summary.
- Duplicate/confidence indicators.
- Decision drawer: approve/reject/manual review.
- Audit note/reason.

## 9. Admin review moderation

Components:
- Queue filters.
- Content/media preview.
- Station/place context.
- Approve/reject/hide actions.
- Reason input.
