# EcoTransit Project Checklist & Progress Tracker

Track checklist of completed batches across the **Lướt Khói Chạm Xanh** campaign.

## Release Status Check
```txt
READY FOR OWNER FINAL VISUAL + INTEGRATED UAT
MERGE / DEPLOY / TAG: FORBIDDEN
PRODUCTION EMAIL VERIFICATION: BLOCKED BY OWNER SMTP CONFIGURATION
```

---

## Batch 01 — Core Route Planner & Station Map

- `[x]` Backend Routing API & Dijkstra Engine
  - `[x]` Implement `GET /api/stations` with Zod validation
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
  - `[x]` Extend Prisma schema: Add `UserWallet` and `eventType` to `PointsLedger`
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
  - `[x]` Run database schema sync
  - `[x]` Update seed scripts to populate 10 diverse reward vouchers and initial redemptions/points logs
- `[x]` Backend API Implementation
  - `[x]` Create `/api/rewards` endpoint with query parameters and DTO mapping
  - `[x]` Create detail `/api/rewards/:slug` endpoint checking user limits and eligibility
  - `[x]` Implement transaction-safe redemption endpoint `/api/rewards/:slug/redeem` handling balance/stock updates and ledger inserts
  - `[x]` Implement `/api/rewards/mine` returning privacy-scrubbed user voucher portfolio
- `[x]` Frontend Component & Dashboard
  - `[x]` Create `RewardsSection.tsx` with category filters, voucher grid, confirmation modal, and owned vouchers tab
  - `[x]` Mount `RewardsSection` on the main page underneath the wallet panel

---

## Batch 05 to Batch 09 — App Shell & Polishing

- `[x]` Moderator/Admin Console
  - `[x]` Build audit logs history tracking
  - `[x]` Implement voucher, review, and ticket moderation screens for administrators
- `[x]` Time Bill Generator & Social Share
  - `[x]` Implement shareable public pages scrubbing sensitive data
- `[x]` Deployment & Production Configs
  - `[x]` Enable CORS secure sameSite cookie attributes and database connection limits
- `[x]` Gamified Campaign Hub Redesign
  - `[x]` Layout 6-station interactive Metro map
  - `[x]` Set up collapsible navigation blocks
- `[x]` Navigation Rail & Responsive Layouts
  - `[x]` Build drag-to-scroll horizontal header menu displaying active/hover indicator styles
  - `[x]` Ensure responsive layouts scaling perfectly at 1920px, 1440px, 1366px, and 390px mobile viewports

---

## Epic 10 — Customer Feedback Acceptance & Security Hardening

- `[x]` Reconcile Avatar Character Builder
  - `[x]` Implement vector inline SVG avatar graphics builder
  - `[x]` Configure 5 illustrated presets, completely removing raw emojis from selections
- `[x]` Implement Pure Config Normalizer
  - `[x]` Write `normalizeAvatarConfig` converting legacy database values/emojis into default `'student'` preset configuration
- `[x]` Harden Verification Token Security
  - `[x]` Clean HTTP API responses to prevent token leakage (`mockToken`, `isMock`)
  - `[x]` Clear browser console logs from rendering token values
- `[x]` Enforce Production SMTP Safety Gates
  - `[x]` Restrict fake transport mocks creation only under local development mode
  - `[x]` Hard block fallback mail mechanisms when running `NODE_ENV=production` or `APP_MODE=demo`
  - `[x]` Trigger registration state rollbacks if SMTP dispatches fail, while preserving current profiles during resend errors
- `[x]` Compile Visual Proof Artifact Manifest
  - `[x]` Record screenshots and user recordings verifying functional features at final HEAD (`99d68ae2de1b23dc412ca96d91d0d03e9c6c8361`)
  - `[x]` Author `OWNER_VISUAL_EVIDENCE.md` document tracking UAT image paths
- `[x]` Execute Final Gates Verification
  - `[x]` Verify Vitest test suite (`111/111 automated tests passed`)
  - `[x]` Confirm Playwright E2E suites passing cleanly
