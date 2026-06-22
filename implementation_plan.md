# EcoTransit RC2 — P0-D Metro Glide & P0-E Workspace Height Remediation

## Background

Owner re-tested P0 items and found two remaining failures:
- **P0-D**: Metro appears to teleport instead of gliding continuously between stations
- **P0-E**: Route workspace is too cramped at 1366×768 with Hub open (needs ≥380px clientHeight)

All other P0 items PASSED and are regression guards.

---

## Forensic Root Cause Analysis

### P0-D — Why Metro Still Teleports

Five root causes identified by code inspection of [CampaignHub.tsx](apps/web/components/CampaignHub.tsx):

| # | Root Cause | Location | Effect |
|---|-----------|----------|--------|
| 1 | **Duration too short** | [L259-260](apps/web/components/CampaignHub.tsx#L259-L260) | `Math.max(450, distance * 1.2)` — adjacent stations at ~150px = 450ms. Owner spec requires **≥650ms**. Motion appears instant. |
| 2 | **ResizeObserver snaps train** | [L343-345](apps/web/components/CampaignHub.tsx#L343-L345) | Observer calls `updateTrainPosition(true)` which cancels RAF and snaps to target instantly, **killing any running animation**. |
| 3 | **Scene change triggers layout reflow** | [page.tsx L262-326](apps/web/app/page.tsx#L262-L326) | When `activeSection` changes → AnimatePresence re-renders scene content → track container dimensions shift → ResizeObserver fires → **snap** |
| 4 | **useEffect re-registration** | [L334-356](apps/web/components/CampaignHub.tsx#L334-L356) | Effect on `[mounted, isCollapsed]` re-creates observer and calls `setTimeout(() => updateTrainPosition(true), 50)` — this fires an immediate snap 50ms after mount/collapse change. |
| 5 | **setState on every frame** | [L272](apps/web/components/CampaignHub.tsx#L272) | `setCurrentTrainPos()` triggers React re-render every animation frame. React batching/reconciliation overhead causes frame drops that look like teleport. |

---

## Proposed Changes

### Component 1: Metro Animation Engine

#### [MODIFY] [CampaignHub.tsx](apps/web/components/CampaignHub.tsx)

**1. Replace `setState`-driven animation with direct DOM manipulation via ref:**
- Add a `trainElRef = useRef<HTMLDivElement>(null)` for direct transform updates
- In the RAF loop, write `trainElRef.current.style.transform = translate3d(...)` directly instead of `setCurrentTrainPos()`
- Only call `setCurrentTrainPos()` at animation **end** (single React render) for final state sync
- This eliminates per-frame React re-renders

**2. Fix motion profile to meet Owner spec:**
- min duration: 650ms (adjacent station)
- max duration: 1150ms (farthest station)  
- easing: cubic-bezier ease-in-out, no overshoot
- formula: Math.min(1150, Math.max(650, distance * 2.5))

**3. Guard against ResizeObserver killing animation:**
- Add an `isAnimatingRef = useRef(false)` flag
- ResizeObserver callback: if `isAnimatingRef.current === true`, **skip** the immediate snap; only adjust `targetBerth` if layout changed, and let the running animation naturally converge to the new target
- On animation end: set `isAnimatingRef.current = false`
- Window resize (while NOT animating): snap immediately as before

**4. Rapid-retarget behavior:**
- On new station click while animation is running: cancel current RAF, read `currentPosRef.current` (which has the real intermediate position), start new animation from there
- No queue — always retarget from current actual position

---

### Component 2: Workspace Height Budget

#### [MODIFY] [CampaignHub.tsx](apps/web/components/CampaignHub.tsx)

- Reduce desktop Hub compact height from `h-28` (112px) to `h-20` (80px)
- Reduce Hub header padding from `pb-1.5 sm:pb-2 mb-1.5 sm:mb-2` to `pb-1 sm:pb-1.5 mb-1 sm:mb-1`
- Reduce Hub outer padding from `p-2 sm:p-3` to `p-1.5 sm:p-2`
- Station button size from `w-8 h-8` to `w-7 h-7`
- Train SVG positioning adjusted to match the reduced lane height
- Total Hub saving: ~40-50px

#### [MODIFY] [page.tsx](apps/web/app/page.tsx)

- Reduce main padding from `py-2 sm:py-3` to `py-1 sm:py-1.5`
- Reduce scene viewport padding from `p-4 sm:p-6` to `p-3 sm:p-4`
- Reduce `my-2` gap between Hub and scene to `my-1`
- Total saving: ~20px

#### [MODIFY] [HeroSection.tsx](apps/web/components/HeroSection.tsx)

- Remove the mandatory `min-h-[280px] lg:min-h-[320px]` — let it size naturally
- Reduce padding from `p-4 sm:p-8 lg:p-10` to `p-3 sm:p-5 lg:p-6`
- Reduce the right-side graphic max-width from `350px` to `240px` and hide on smaller desktop viewports where height is constrained
- Reduce `mb-4` to `mb-2`
- Reduce inner spacing `space-y-6` to `space-y-3`
- Total saving: ~120-160px

#### [MODIFY] [RoutePlannerShell.tsx](apps/web/components/RoutePlannerShell.tsx)

- Reduce `space-y-6` to `space-y-4` between form sections
- Reduce grid gap from `gap-6` to `gap-4`
- Marginal height savings

---

### Component 3: Tests

#### [MODIFY] [epic10.spec.ts](apps/web/tests/epic10.spec.ts)

Add/update tests:
1. **Metro continuous glide proof test**: Click station A→B, capture transform at start, ~200ms, ~400ms (mid), and end. Assert each intermediate differs from start and end.
2. **Duration assertion**: Measure actual wall-clock time from first position change to final rest. Assert ≥650ms for adjacent station.
3. **Rapid 4-station retarget**: Click 4 stations in 100ms intervals, verify final position matches last station, no queue.
4. **Workspace height test**: Assert `scene-viewport clientHeight ≥ 380` at 1366×768
5. **Scroll/wheel/thumb**: Assert scrollHeight > clientHeight after route results, wheel increases scrollTop

#### [MODIFY] [capture_evidence.spec.ts](apps/web/tests/capture_evidence.spec.ts)

Capture new evidence:
- `06-real-metro-mid-transition-no-overlap.png`
- `07-real-metro-rapid-switch.webm`
- `07a-real-metro-single-click-glide.webm`
- `16-route-workspace-1366-top.png`
- `17-route-workspace-1366-result-scrolled-bottom.png`
- `17a-route-workspace-1366-height-proof.png`

---

## Regression Guards

All changes will be verified against:

| Guard | What to check |
|-------|--------------|
| Two-car Metro | SVG still has 2 carriage bodies + coupler |
| No icon/label overlap | Collision test at start/mid/end positions |
| Avatar attachment | Avatar div still inside train container |
| Footer safety | Footer rect.y ≥ viewport rect.y + viewport height |
| Wheel scroll + thumb | scrollHeight > clientHeight, scrollTop increases |
| Desktop 1366/1440/1920 | Layout doesn't clip |
| Mobile 390×800 | Mobile train visible, no overflow |
| Other scenes (XanhWrap, Rewards) | No regression from Hub/workspace CSS changes |

---

## Verification Plan

### Automated Tests

```bash
npm run build
npm run test
npx playwright test apps/web/tests/route-planner.spec.ts --config=apps/web/playwright.config.ts --project=chromium-desktop --reporter=line --repeat-each=5 --retries=0 --workers=1
npx playwright test apps/web/tests/epic10.spec.ts --config=apps/web/playwright.config.ts --project=chromium-desktop --reporter=line --retries=0 --workers=1
npx playwright test apps/web/tests/capture_evidence.spec.ts --config=apps/web/playwright.config.ts --project=chromium-desktop --reporter=line --retries=0 --workers=1
```
