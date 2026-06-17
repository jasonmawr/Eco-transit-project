# Complete Functional Requirements Matrix

Priority definitions:

- P0: required for first complete release.
- P1-required: required if the customer expects “complete product”, included in this final scope.
- P1-later: useful after launch but not blocking if explicitly waived.

| ID | Requirement | Priority | Actor | Acceptance |
|---|---|---|---|---|
| FR-001 | Premium public landing page | P0 | Guest | Shows hero, route CTA, features, content, rewards, responsive UI |
| FR-002 | Map-first route planner | P0 | Guest | Origin/destination/current-location input, route list and map display |
| FR-003 | Bus + metro + walking route options | P0 | Guest | At least one multimodal route option when provider/seed supports it |
| FR-004 | Metro line/station route lookup parity | P0 | Guest | Shows fare estimate, time, distance, station count/legs comparable to benchmark |
| FR-005 | Weather-aware scoring | P0 | Guest | Rain/heat changes scoring and explanation text |
| FR-006 | Route detail timeline | P0 | Guest | Displays legs, wait/walk/ride time, transfer count, fare estimate |
| FR-007 | Station list and station detail | P0 | Guest | 14 Line 1 stations seeded; details show location/amenities/content |
| FR-008 | Nearby POI discovery | P0 | Guest | Filter by station/category; map and list mode; distance/walking time |
| FR-009 | Digital map layers | P0 | Guest | Stations, POIs, route, selected trip and guide/review markers |
| FR-010 | Articles/videos/guides | P0 | Guest/Admin | Admin can publish; public can browse; station/weather/schedule tags exist |
| FR-011 | Quiz | P1-required | Guest/User | Submit answers and get persona + route/content suggestions |
| FR-012 | Account registration/login | P0 | User | Google OAuth2 and email/password fallback, no token in localStorage |
| FR-013 | Profile and points wallet | P0 | User | Shows current points, ledger, tickets, redemptions, bills, reviews |
| FR-014 | Ticket photo upload | P0 | User | Valid jpg/png/webp accepted, private storage, pending status returned |
| FR-015 | Async ticket verification | P0 | System/Moderator | OCR/rules/duplicate checks; uncertain tickets enter manual review |
| FR-016 | Manual ticket review | P0 | Moderator/Admin | Approve/reject/manual review with reason and audit log |
| FR-017 | Points ledger | P0 | System | Points recorded immutably with source and balance_after |
| FR-018 | Reward/voucher catalog | P0 | Guest/User/Admin | Public catalog visible; redemption requires auth |
| FR-019 | Voucher redemption | P0 | User | Transaction checks balance/inventory/expiry and issues code |
| FR-020 | Voucher admin | P0 | Admin | CRUD vouchers, inventory, validity and code import/manual codes |
| FR-021 | UGC review submission | P0 | User | Review/guide submitted as pending, not public until approved |
| FR-022 | UGC moderation | P0 | Moderator/Admin | Approve/reject with reason, audit log and notifications |
| FR-023 | Time bill generation | P0 | Guest/User | Creates bill from selected route/trip with summary and share URL |
| FR-024 | Bill privacy controls | P0 | Guest/User | Default station_only; exact coordinates hidden unless explicitly chosen |
| FR-025 | Social share fallback | P0 | Guest/User | Native share where available; copy/share URL fallback always works |
| FR-026 | OG/social card | P1-required | Guest/User | Public bill URL has share title/description/card metadata |
| FR-027 | Notifications | P1-required | User | In-app notification for ticket, points, voucher, moderation events |
| FR-028 | Admin dashboard | P0 | Admin | Shows tickets pending, reviews pending, voucher stats, content stats |
| FR-029 | Admin content CMS | P0 | Admin | TipTap content editor, publish/draft/archive, video embed support |
| FR-030 | Admin station/POI data management | P1-required | Admin | View/edit seeded stations/POIs, source and active status |
| FR-031 | Audit logs | P0 | Admin | Shows admin/moderation/security events with actor and target |
| FR-032 | Settings/geofence | P1-required | Admin | Admin can update central-area polygon/config without code change |
| FR-033 | i18n foundation | P1-required | Guest/User | Vietnamese complete, English public core labels; language architecture exists |
| FR-034 | Feedback/contact | P1-required | Guest/User | User can send feedback with category and context |
| FR-035 | Health endpoint | P0 | System | `/healthz` and `/readyz` show DB/cache/storage/provider checks |
| FR-036 | Operational exports | P1-required | Admin | CSV export for tickets, points, vouchers, reviews and audit |
