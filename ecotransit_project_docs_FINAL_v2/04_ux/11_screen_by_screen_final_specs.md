# Screen-by-Screen Final Specs

## Public screens

### 1. Home

Required sections:
- Hero with route search input.
- “Đi đâu hôm nay?” quick suggestions.
- Weather-aware value proposition.
- Featured stations/places.
- Guides/videos.
- Rewards teaser.
- Time bill teaser.
- Footer with policy/contact/language.

Acceptance: user can start route search without creating account.

### 2. Route Planner / Map

Required elements:
- Full map or large map region.
- Origin/destination search.
- Current location button.
- Departure time selector.
- Preference chips: ít đi bộ, ít đổi tuyến, nhanh nhất, tiết kiệm.
- Weather chip.
- Route result bottom sheet on mobile.
- Route list and selected route polyline.
- CTA: xem chi tiết, tạo bill, lưu tuyến.

### 3. Route Detail

Required elements:
- Summary: total time, fare estimate, walking, waiting, transfer count.
- Weather explanation.
- Timeline legs: walk, bus, metro, transfer.
- Station/platform hints if available.
- Nearby content at destination.
- Create time bill CTA.

### 4. Station Detail

Required elements:
- Station name, line, address, map preview.
- Facilities/amenities.
- First/last train/schedule placeholder if data exists.
- Nearby places.
- Guides/videos tied to station.
- Approved user reviews.
- CTA: find route to this station, add review.

### 5. Nearby Discovery

Required elements:
- Station filter.
- Category filter: café, food, shopping, service, study, entertainment, verified offers.
- Map/list toggle.
- Place card: name, category, distance, walking minutes, source, rating/review snippet.
- Guide/review chips.

### 6. Guides / Videos

Required elements:
- Article/video list.
- Filters: station, weather, beginner, bus+metro, weekend.
- Detail page with readable typography and related routes/stations.

### 7. Quiz

Required elements:
- Friendly multi-step questions.
- Persona result.
- Suggested route/content/reward next action.

### 8. Auth

Required elements:
- Google login primary.
- Email/password fallback.
- Clear privacy note.
- No token display/localStorage.

### 9. Ticket Upload

Required elements:
- Upload/drop camera-friendly UI.
- Allowed format/size guidance.
- Ticket type and trip date fields.
- Status after upload: pending/manual_review/verified/rejected.
- Explanation that points are awarded after verification.

### 10. Points Wallet

Required elements:
- Current points.
- Ledger history.
- Ticket status list.
- Redemption history.
- Friendly empty states.

### 11. Rewards

Required elements:
- Voucher catalog.
- Cost, validity, inventory state.
- Redeem flow with confirmation.
- Success code display and usage note.

### 12. Time Bill

Required elements:
- Bill preview card.
- Privacy selector.
- Share URL/copy/native share.
- Public bill page.
- Delete/unpublish if user owns it.

### 13. Reviews/Guides Submission

Required elements:
- Station/place picker.
- Rating/content/media.
- Submission state pending moderation.
- Edit/resubmit if rejected.

## Admin screens

### 14. Admin Dashboard

Cards: pending tickets, pending reviews, active vouchers, route searches, shares, errors.

### 15. Ticket Moderation

List, filters, ticket image signed URL, OCR text, score, duplicate hints, approve/reject/manual note.

### 16. Review Moderation

List, content preview, media, approve/reject reason, abuse flag.

### 17. CMS

TipTap editor, post type, station/weather tags, video URL, draft/publish/archive.

### 18. Voucher Management

Catalog CRUD, code import, inventory, validity, redemptions, pause/archive.

### 19. Station/POI Management

Seed list, edit station metadata, POI source, active status, featured flag.

### 20. Audit Logs and Settings

Search/filter logs, provider status, geofence config, app settings.
