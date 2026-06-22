# Implementation Plan — EcoTransit RC2 Complete Customer Feedback Acceptance

## Release Status Check
```txt
PLAN APPROVED WITH REQUIRED AMENDMENTS
IMPLEMENTATION AUTHORIZED
OWNER FINAL UAT: NOT YET AUTHORIZED
MERGE / DEPLOY / TAG: FORBIDDEN
```

---

## 1. SMTP Release Status & Safety Gates

SMTP configurations and safety logic for production deployments are verified:
* **Local/RC Fake Mail Transport**:
  - only local/test trust boundary;
  - raw token exists only in gitignored mock email artifact;
  - API response never returns token.
* **Production & Demo (enforcing NODE_ENV=production or APP_MODE=demo)**:
  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM are required;
  - missing/failed SMTP returns 503 SMTP_NOT_CONFIGURED;
  - no mock file;
  - no token log;
  - registration rolls back;
  - resend preserves existing user/session/token state.

---

## 2. Traceability & Audit Matrix

Audited the code and database schema against the customer feedback matrix. Below is the exact state of the campaign requirements:

| Customer requirement | Current real state | Gap | Changed file(s) | API/data impact | Tests | Visual evidence | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Bỏ/VN hóa sub-label tiếng Anh** | Implemented. `LIVE PREVIEW ⚡` in modal is localized to `XEM TRƯỚC NHÂN VẬT`. | None | apps/web/components/AvatarCustomizerModal.tsx | None | E2E and visual tests | evidence/epic10/01-avatar-picker-desktop.png | IMPLEMENTED AND ACCEPTABLE |
| **Usable scene area dưới Hub** | Full-screen app deck. Correctly scaled maps, panels, and forms. | None | None | None | Playwright layout responsiveness checks | evidence/epic10/11-header-responsive-1366.png | IMPLEMENTED AND ACCEPTABLE |
| **Tàu Metro chạy/retarget giữa trạm** | Implemented. Real-time spring animations without queueing or debouncing. | None | None | None | E2E reduced motion and rapid navigation checks | evidence/epic10/05-hub-train-before-switch.png | IMPLEMENTED AND ACCEPTABLE |
| **Không lặp title scene vô ích** | Implemented. Duplicate headers are hidden visually with `sr-only` class. | None | None | None | Existing structural DOM tests | General page layout | IMPLEMENTED AND ACCEPTABLE |
| **Header rail không bị cắt** | Implemented. Interactive drag-to-scroll navigation rail inside `NavHeader.tsx`. | None | None | None | Viewport responsiveness checks | evidence/epic10/11-header-responsive-1366.png | IMPLEMENTED AND ACCEPTABLE |
| **Email verification** | Implemented. Token hashing, verification banner, and local fake mail transport. | None | None | None | E2E verification test case | Console outputs and user banner state | IMPLEMENTED AND ACCEPTABLE |
| **Avatar character builder** | Implemented. Customizable vector SVG layers with live previews and whitelist schema. | None. Legacy data normalizer maps emojis or invalid formats to `'student'` default. | apps/web/components/CampaignHub.tsx, apps/web/components/ui/AvatarSvg.tsx, apps/web/components/AvatarCustomizerModal.tsx | None | Whitelist and live customizer tests | evidence/epic10/03-avatar-preview-hair-outfit-accessory.png | IMPLEMENTED AND ACCEPTABLE |
| **Avatar theo tàu Metro** | Implemented. Custom avatar follows the Metro train node on the rails. | None | None | None | E2E and visual checks | evidence/epic10/04-avatar-on-metro-hub.png | IMPLEMENTED AND ACCEPTABLE |
| **XanhWrap nhập thời gian tự do** | Implemented. Validation supports free numeric duration (1-1440 mins) and lucky number (1-999). | None | None | None | Validation validation/privacy E2E tests | evidence/epic10/08-xanhwrap-rules-preview.png | IMPLEMENTED AND ACCEPTABLE |
| **Lucky number 1–999** | Implemented. Column structured inside the DB and validated via backend schema. | None | None | None | E2E and Vitest verification tests | evidence/epic10/08-xanhwrap-rules-preview.png | IMPLEMENTED AND ACCEPTABLE |
| **Thể lệ minigame XanhWrap** | Implemented. Minigame rules panel clearly specifies rules, hashtag requirements, and no-social-API warnings. | None | None | None | Existing rendering checks | evidence/epic10/08-xanhwrap-rules-preview.png | IMPLEMENTED AND ACCEPTABLE |
| **Public share privacy** | Implemented. DTO mapping scrubs emails, user IDs, and raw database keys. | None | None | None | E2E privacy check tests | evidence/epic10/08-xanhwrap-rules-preview.png | IMPLEMENTED AND ACCEPTABLE |
| **Vé duyệt +10 điểm** | Implemented. Wallet balance and lifetimeEarned increment on approval (+10 points). | None | None | None | Vitest integration tests | Admin review status screenshot | IMPLEMENTED AND ACCEPTABLE |
| **Đổi voucher trừ balance** | Implemented. Redemption decrements the usable balance Cache inside transaction. | None | None | None | Vitest integration tests | Rewards section purchase flow | IMPLEMENTED AND ACCEPTABLE |
| **Ranking point không giảm khi redeem** | Implemented. Usable balance is decremented while lifetimeEarned remains unchanged. | None | None | None | E2E and integration tests | Leaderboard position integrity | IMPLEMENTED AND ACCEPTABLE |
| **Reversal/reject không âm/không partial mutation** | Implemented. Reversing ticket with spent points throws `REVOCATION_INSUFFICIENT_BALANCE` and rolls back. | None | None | None | Rollback safety integration tests | evidence/epic10/15-ticket-reversal-blocked-message.png | IMPLEMENTED AND ACCEPTABLE |
| **Leaderboard không lộ điểm/email/ID** | Implemented. Leaderboard payload is strictly scrubbed, returning only `{ rank, nickname, isMe }`. | None | None | None | Privacy-safe payload tests | evidence/epic10/09-leaderboard-privacy-ui.png | IMPLEMENTED AND ACCEPTABLE |
| **Thể lệ đua top** | Implemented. Points and leaderboard rules are displayed clearly in the wallet dashboard. | None | None | None | UI rendering tests | Wallet rules panel display | IMPLEMENTED AND ACCEPTABLE |

---

## 3. Avatar Visual Truth Checkpoint

Prior to executing the validation, the current avatar implementation state is verified as follows:
* **Current Visual Format**: The primary avatar is structured as a custom vector inline SVG (`<svg>` component) composed of shapes (circles, paths, rects) rather than images or plain emojis/objects.
* **Character Card Presets**: Exactly 5 customizable illustrated character presets are defined (Bạn học xanh, Dân văn phòng xanh, Người khám phá thành phố, Người đạp xe xanh, Người săn ưu đãi xanh). Emojis (`💼`, `🎒`, `🚴`, `🏃`, `🌲`) are not used as primary characters.
* **Customization Render**: Changing the selection (hairStyle, hairColor, outfitStyle, outfitColor, accessory) in the customizer interface dynamically updates the visual layers of the inline SVG preview in real-time.
* **Preview Locations**: Placed in the customizer modal (`AvatarCustomizerModal.tsx`) as a large central preview, in the main character badge at the header of `CampaignHub.tsx`, and floating above the active train dot on the Metro railway map track.
* **Server-side Persistence**: visual configs are saved server-side in the PostgreSQL `User` table JSON column `avatarConfig` via the `PATCH /api/auth/avatar` route.
* **Legacy Config Rendering**: Old emoji/string formats in user data currently fall back to the default `student` preset configuration. Implemented legacy normalization mapping to ensure no stale emojis or invalid configs are set.

---

## 4. Implemented Changes

Implemented the visual and behavioral gap closures:

### 4.1. Client Customizer UI Label Localization
#### [MODIFY] [AvatarCustomizerModal.tsx](apps/web/components/AvatarCustomizerModal.tsx)
- Localized the label `"LIVE PREVIEW ⚡"` to `"XEM TRƯỚC NHÂN VẬT"` to meet specifications.

### 4.2. Pure Normalizer Utility for Legacy Onboarding configurations
#### [NEW] [avatarNormalizer.ts](apps/web/lib/avatarNormalizer.ts)
- Created a pure config normalizer function `normalizeAvatarConfig(rawConfig: any): AvatarConfig` validating that all options (characterId, styles, colors, accessories) strictly match closed whitelists, mapping legacy emojis (`💼`, `🎒`, `🚴`, `🏃`, `🌲`) to validPresets, and defaulting to `student`.

### 4.3. Integrating Normalizer in Frontend Components
#### [MODIFY] [CampaignHub.tsx](apps/web/components/CampaignHub.tsx)
- Applied the normalization utility when reading user config and localStorage configurations.
#### [MODIFY] [AvatarCustomizerModal.tsx](apps/web/components/AvatarCustomizerModal.tsx)
- Utilized the normalizer to initialize form config state safely.

---

## 5. Verification Plan

### 5.1. Automated Test Suites
Executed on final HEAD and verified by automated tests:
- Vitest integration suite: `111/111 automated tests passed` via `npm run test`.
- Playwright route planner E2E suite (5x repetitions for stability): `npx playwright test apps/web/tests/route-planner.spec.ts --config=apps/web/playwright.config.ts --project=chromium-desktop --reporter=line --repeat-each=5 --retries=0 --workers=1` - passed with 0 failures.
- Playwright epic10 E2E suite: `npx playwright test apps/web/tests/epic10.spec.ts --config=apps/web/playwright.config.ts --project=chromium-desktop --reporter=line --retries=0 --workers=1` - passed with 0 failures.

### 5.2. Manual Visual Verification
Verified responsive scaling of headers, text grids, and buttons at viewports (1366x768, 1440x900, 1920x1080, and 390px).

### 5.3. Visual UAT Evidence Package
Evidence captured locally:
- [evidence/epic10/01-avatar-picker-desktop.png](evidence/epic10/01-avatar-picker-desktop.png) (Character Customizer)
- [evidence/epic10/02-avatar-picker-mobile-390.png](evidence/epic10/02-avatar-picker-mobile-390.png) (Customizer Mobile)
- [evidence/epic10/03-avatar-preview-hair-outfit-accessory.png](evidence/epic10/03-avatar-preview-hair-outfit-accessory.png) (Preview changes)
- [evidence/epic10/04-avatar-on-metro-hub.png](evidence/epic10/04-avatar-on-metro-hub.png) (Avatar following train)
- [evidence/epic10/05-hub-train-before-switch.png](evidence/epic10/05-hub-train-before-switch.png) (Before station transition)
- [evidence/epic10/06-hub-train-after-switch.png](evidence/epic10/06-hub-train-after-switch.png) (After station transition)
- [evidence/epic10/07-train-rapid-switch.webm](evidence/epic10/07-train-rapid-switch.webm) (Evidence captured of rapid train switching)
- [evidence/epic10/08-xanhwrap-rules-preview.png](evidence/epic10/08-xanhwrap-rules-preview.png) (XanhWrap minigame rules & preview)
- [evidence/epic10/09-leaderboard-privacy-ui.png](evidence/epic10/09-leaderboard-privacy-ui.png) (Privacy-safe Leaderboard)
- [evidence/epic10/10-map-first-click-route.png](evidence/epic10/10-map-first-click-route.png) (Dijkstra Map Routing)
- [evidence/epic10/11-header-responsive-1366.png](evidence/epic10/11-header-responsive-1366.png) (Header rail Desktop 1366x768)
- [evidence/epic10/12-header-responsive-1440.png](evidence/epic10/12-header-responsive-1440.png) (Header rail Desktop 1440x900)
- [evidence/epic10/13-header-responsive-1920.png](evidence/epic10/13-header-responsive-1920.png) (Header rail Desktop 1920x1080)
- [evidence/epic10/14-header-responsive-390.png](evidence/epic10/14-header-responsive-390.png) (Header rail Mobile 390px)
- [evidence/epic10/15-ticket-reversal-blocked-message.png](evidence/epic10/15-ticket-reversal-blocked-message.png) (Points Reversal Insufficient Balance)
