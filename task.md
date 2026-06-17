# EcoTransit Project Checklist & Progress Tracker

Track checklist of completed batches across the **Lướt Khói Chạm Xanh** campaign.

---

## Batch 01 — Core Route Planner & Station Map

- `[x]` Backend Routing API & Dijkstra Engine
  - `[x]` Implement `GET /api/stations` with accent-insensitive search and Zod validation
  - `[x]` Implement `GET /api/stations/:id` with Zod validation and POI mapping
  - `[x]` Implement `GET /api/weather/presets` returning standard static presets
  - `[x]` Implement `POST /api/routes/search` with request parameters validation
  - `[x]` Build proper Dijkstra pathfinding in `LocalRouteProvider.ts` integrating weather & preferences
- `[x]` Frontend Mobility Cockpit UI Components
  - `[x]` Implement mobile-first responsive layout (390px)
  - `[x]` Build `WakeUpBanner` to shield API cold starts
  - `[x]` Create custom Combobox/Select overlays for station inputs
  - `[x]` Integrate interactive Leaflet map overlays with pathing polylines
  - `[x]` Design vertical segment boarding pass timeline (`RouteTimeline`)
  - `[x]` Implement `StationDetailCard` display for nearby POIs
- `[x]` Proxy Setup & API Standardization
  - `[x]` Create Next.js API rewrites to proxy `/api/*` requests in development
  - `[x]` Standardize API client utility for localhost / production resolution

---

## Batch 01D-HF1/HF2 — UI Hotfixes & Brand Alignment

- `[x]` Logo & Visual Alignment
  - `[x]` Update header and footer logo branding to **Lướt Khói Chạm Xanh** campaign wordmark
  - `[x]` Configure Outfit and Inter typography fonts with clean geometric styling
  - `[x]` Apply 4-color campaign palette (Electric Blue, Vibrant Green, Urban Beige, Dark Charcoal)
- `[x]` Premium Motion Primitives
  - `[x]` Implement `PremiumCta` with glowing borders and magnet-inspired physics
  - `[x]` Implement `NavHeader` with sliding-pill cursor indicator
  - `[x]` Implement `FluidDropdown` with elastic animations and outside-click controls
  - `[x]` Implement `MotionFlowBackground` with SVG noise grain textures and floating leaf accents
  - `[x]` Accessibility Check: Respect `useReducedMotion` preferences

---

## Batch 02 — Station Experience & UGC Foundation

- `[x]` Backend UGC & Review Management
  - `[x]` Implement database models for `UGCReview` and POIs (`Place`)
  - `[x]` Build review submit endpoint `POST /api/reviews` with validation and status default `pending`
  - `[x]` Build review retrieve endpoint `GET /api/stations/:id/reviews` returning only approved reviews
  - `[x]` Implement review approval/rejection endpoints for admin moderation
- `[x]` Station Portal & Guides
  - `[x]` Implement travel guidelines/articles schema and endpoint
  - `[x]` Create interactive `StationExperience` tabbed layout (Places to Visit, Station Reviews, Guide Articles)
  - `[x]` Implement interactive rating submit form and reviews feed list
  - `[x]` Add dynamic custom icons and color schemes for POI categories (Cafe, Food, Shopping, etc.)

---

## Batch 03 — Ticket Upload & Green Points Ledger

- `[x]` Database Schema Expansion & Seed
  - `[x]` Extend Prisma schema: Add `UserWallet` (1-to-1 relationship with `User`) and `eventType` to `PointsLedger`
  - `[x]` Expand `Ticket` model with file metadata, original filename, upload path, and mock OCR text
  - `[x]` Configure seed files with users, wallets, sample tickets, and points ledgers
- `[x]` Secure Upload & Jimp Processing
  - `[x]` Set up memory multer storage and hard limit checks (2MB)
  - `[x]` Implement Jimp image resizing (800px max-width) and progressive quality encoding (75% -> 60% JPEG) to clamp outputs under 500KB
  - `[x]` Implement image validators (SVG rejection, fake image decode checks, empty 0-byte file check)
  - `[x]` Implement duplicate checking using SHA-256 compound user-unique index `@@unique([userId, duplicateHash])`
  - `[x]` Create thumbnail server endpoint `/api/tickets/thumbnail/:id` validating ownership & path traversal
  - `[x]` Scrub `GET /api/tickets/mine` response to protect user privacy (no email, path, or reviewerId)
- `[x]` Points Ledger & Review Security
  - `[x]` Implement `/tickets/:id/review` endpoint restricting access strictly to Admin/Moderator roles
  - `[x]` Implement atomic transactions for wallet updates and idempotency ledger inserts
  - `[x]` Enforce clamping on points awarded ([5, 100], defaulting to 20)
- `[x]` Web Wallet Dashboard Components
  - `[x]` Design `TicketWalletSection` interface incorporating wallet cards, upload forms, and transaction lists
  - `[x]` Setup client-side upload validations, loading indicators, and error/success alerts
  - `[x]` Check responsive layout down to mobile (390px)

---

## Batch 04 — Rewards / Voucher Wallet

- `[x]` Database Schema Expansion & Seed
  - `[x]` Add nullable `slug` column to `Voucher` to ensure safe migration without default conflicts
  - `[x]` Extend `Voucher` and `VoucherRedemption` models in `schema.prisma` with status, limit, validity, and metadata
  - `[x]` Run database schema sync (`npx prisma db push --accept-data-loss`)
  - `[x]` Update seed scripts to populate 10 diverse reward vouchers and initial redemptions/points logs
- `[x]` Backend API Implementation
  - `[x]` Create `/api/rewards` endpoint with query parameters (category, q, availableOnly) and DTO mapping
  - `[x]` Create detail `/api/rewards/:slug` endpoint checking user limits and eligibility
  - `[x]` Implement transaction-safe redemption endpoint `/api/rewards/:slug/redeem` handling balance/stock updates and ledger inserts
  - `[x]` Implement `/api/rewards/mine` returning privacy-scrubbed user voucher portfolio
  - `[x]` Enforce security rules (limit checks, points clamping, idempotency, role guards)
- `[x]` Frontend Component & Dashboard
  - `[x]` Create `RewardsSection.tsx` with category filters, voucher grid, confirmation modal, and owned vouchers tab
  - `[x]` Mount `RewardsSection` on the main page underneath the wallet panel
  - `[x]` Hook wallet balance refresh and Vietnamese event status description logic
- `[x]` Integration Tests & Verification
  - `[x]` Create `rewards.test.ts` validating all constraints (unauthenticated 401, insufficient points, out of stock, user limit, idempotency)
  - `[x]` Run all regression test suites (Vitest 46/46 passed)
  - `[x]` Verify health probes resolved cleanly

