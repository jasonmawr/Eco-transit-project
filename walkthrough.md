# Walkthrough — Completed Batches (Batch 01 to Epic 10)

Tài liệu ghi nhận chi tiết kết quả triển khai, bàn giao và kiểm chứng kỹ thuật qua toàn bộ các Batch của chiến dịch **Lướt Khói Chạm Xanh — EcoTransit**.

## Release Status Check
```txt
READY FOR OWNER FINAL VISUAL + INTEGRATED UAT
MERGE / DEPLOY / TAG: FORBIDDEN
PRODUCTION EMAIL VERIFICATION: BLOCKED BY OWNER SMTP CONFIGURATION
```

---

## 1. Summary of Changes

### Batch 01 — Core Route Planner & Station Map
- **Dijkstra Engine**: Built pathfinding algorithm integrating weather-presets and preferences (`LocalRouteProvider.ts`).
- **Frontend Mobility Cockpit**: Mobility cockpit interface featuring station search forms, Leaflet Map route overlays, and vertical segment timeline.

### Batch 01D-HF1/HF2 — UI Hotfixes & Brand Alignment
- **Brand Identity**: Standardized logo branding, Outfit and Inter typography, and 4-color palette (Electric Blue, Vibrant Green, Urban Beige, Dark Charcoal).
- **Premium Motion**: Integrated `framer-motion` sliding cursor pill, fluid dropdown with elastic animation, and animated motion background with SVG noise grain texture and floating leaves.

### Batch 02 — Station Experience & UGC Foundation
- **UGC Reviews**: Designed `UGCReview` & `Place` database schema and created review submission API endpoints.
- **Station Experience UI**: Developed tabbed portal displaying POI categories, passenger reviews feed, and eco-travel articles.

### Batch 03 — Ticket Upload & Green Points Ledger
- **Jimp Image Processing**: Implemented image upload validation, duplicate hash detection via SHA-256 compound index, and Jimp image optimization clamping files under 500KB.
- **Points Ledger**: Implemented wallet, points ledger, and transaction history database records.

### Batch 04 — Rewards / Voucher Wallet
- **Voucher Redemption**: Created transaction-safe vouchers redemption API with user limits checks, stock controls, and points balances subtraction.

### Batch 05 — Moderator/Admin Console
- **Admin Portal**: Created ticket approval/rejection operations, POI management, and audit logs.

### Batch 06 — Time Bill Generator & Social Share
- **Public Share**: Created `/share/lx-...` public page displaying XanhWrap shareable content, scrubbing sensitive user data.

### Batch 07 — Deployment Readiness
- **Neon + Render + Vercel**: Configured cookies sameSite/secure, trust proxy settings, and database pool limits.

### Batch 08 — Final QA / UAT / Polish
- **Static Assets**: Resolved Next.js compilation issues, hydrations, and console warning errors.

### Batch 09 — Customer USER FLOW Alignment & Gamified App Shell
- **Gamified Campaign Hub**: Redesigned home page into a 6-station Metro map layout.
- **Onboarding Avatar**: Integrated custom illustrated avatar picker persisting preferences server-side and client-side.

### Batch 09-HF4/HF8 — Scene Layout & Navigation Rail
- **App-Deck Layout**: Solved clipping via full-screen layout.
- **Scrollable Navigation Rail**: Added drag-to-scroll navigation rail displaying active states and Admin tab inclusion.

### Epic 10 — Customer Feedback Acceptance & Hardened Security
- **Avatar Builder**: Replaced legacy emoji configurations with inline vector SVG builder containing 5 illustrated presets.
- **Normalizer Utility**: Implemented `normalizeAvatarConfig` mapping old configs/emojis securely to whitelisted values.
- **Token Security**: Scrubbed raw token fields (`mockToken`, `isMock`) from API payloads and console logging.
- **SMTP Safety Gates**: Implemented strict safety blocks in production/demo modes to rollback registration upon SMTP failures, prevent fallback mock emails creation, and block token logs.

---

## 2. Verification Outcomes

### Root Build Status
Monorepo build compiled successfully:
- `npm run build` -> **Success** (`$LASTEXITCODE = 0`).

### Integration Test Suite (Vitest)
Executed and verified:
- `111/111 automated tests passed` via `npm run test` backend suite.

### Playwright E2E Suites
Executed on final HEAD:
- `epic10.spec.ts` -> **6/6 tests passed**.
- `route-planner.spec.ts` -> **10/10 tests passed across 5 repeat cycles**.

---

## 3. SMTP & APP_MODE=demo Safety Boundaries

* **Local/RC Fake Mail Transport**:
  - only local/test trust boundary;
  - raw token exists only in gitignored mock email artifact (`last-mock-email.json`);
  - API response never returns token.
* **Production & Demo (enforcing NODE_ENV=production or APP_MODE=demo)**:
  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM are required;
  - missing/failed SMTP returns 503 SMTP_NOT_CONFIGURED;
  - no mock file;
  - no token log;
  - registration rolls back;
  - resend preserves existing user/session/token state.

---

## 4. Visual Evidence Manifest

All visual artifacts are captured locally at the final commit HEAD `99d68ae2de1b23dc412ca96d91d0d03e9c6c8361`:

| Artifact | Description | Viewport |
| :--- | :--- | :--- |
| [01-avatar-picker-desktop.png](evidence/epic10/01-avatar-picker-desktop.png) | Desktop avatar picker displaying 5 illustrated characters. | Desktop (1280x800) |
| [02-avatar-picker-mobile-390.png](evidence/epic10/02-avatar-picker-mobile-390.png) | Responsive mobile avatar picker layout. | Mobile (390x800) |
| [03-avatar-preview-hair-outfit-accessory.png](evidence/epic10/03-avatar-preview-hair-outfit-accessory.png) | Before/after preview demonstrating SVG style modifications. | Desktop (1280x800) |
| [04-avatar-on-metro-hub.png](evidence/epic10/04-avatar-on-metro-hub.png) | Selected avatar visible above active Metro Hub train node. | Desktop (1280x800) |
| [05-hub-train-before-switch.png](evidence/epic10/05-hub-train-before-switch.png) | Metro Hub train station position before rapid navigation switch. | Desktop (1280x800) |
| [06-hub-train-after-switch.png](evidence/epic10/06-hub-train-after-switch.png) | Metro Hub train station position after rapid navigation switch. | Desktop (1280x800) |
| [07-train-rapid-switch.webm](evidence/epic10/07-train-rapid-switch.webm) | Video of rapid station switching and smooth train transitions. | Desktop (1280x800) |
| [08-xanhwrap-rules-preview.png](evidence/epic10/08-xanhwrap-rules-preview.png) | XanhWrap minigame rules and time validation controls. | Desktop (1280x800) |
| [09-leaderboard-privacy-ui.png](evidence/epic10/09-leaderboard-privacy-ui.png) | Scrubbed, privacy-safe leaderboard listing nickname rank states. | Desktop (1280x800) |
| [10-map-first-click-route.png](evidence/epic10/10-map-first-click-route.png) | Route planner Dijkstra map trace on first click. | Desktop (1280x800) |
| [11-header-responsive-1366.png](evidence/epic10/11-header-responsive-1366.png) | Unclipped navigation rail header at 1366px width. | Desktop (1366x768) |
| [12-header-responsive-1440.png](evidence/epic10/12-header-responsive-1440.png) | Unclipped navigation rail header at 1440px width. | Desktop (1440x900) |
| [13-header-responsive-1920.png](evidence/epic10/13-header-responsive-1920.png) | Unclipped navigation rail header at 1920px width. | Desktop (1920x1080) |
| [14-header-responsive-390.png](evidence/epic10/14-header-responsive-390.png) | Scrollable navigation rail header swipe layout on mobile. | Mobile (390x800) |
| [15-ticket-reversal-blocked-message.png](evidence/epic10/15-ticket-reversal-blocked-message.png) | Insufficient balance warning when reversing approved tickets. | Desktop (1280x800) |
