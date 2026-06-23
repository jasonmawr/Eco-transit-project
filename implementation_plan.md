# Implementation Plan — EcoTransit RC2 Blocker A1 Metro Motion Design Reset

This plan details the design and step-by-step changes required to implement a **Rail Travel System** for the visual Metro train journey. The current endpoint-displacement WAAPI engine will be replaced by a single-clock `requestAnimationFrame` progress controller that moves the train along a dedicated rail path.

---

## User Review Required

> [!IMPORTANT]
> - **Single-Clock requestAnimationFrame Engine**: Animate the train using a single `requestAnimationFrame` + `performance.now()` loop. WAAPI dummy property animation is rejected to keep the engine simple and robust.
> - **Progress-Based Positioning**: The train's current visual coordinate will be computed by querying `railPath.getPointAtLength(progress * totalLength)`.
> - **Berth Anchor Separation**: The path is drawn through dedicated, collision-free stop points (berth anchors) on the rail lane, separate from station interaction anchors (icon, badge, click targets).
> - **Visual Energy Flow**: Overlaid visual glow and flowing dash markers restricted to the active segment via a dynamic `<clipPath>` mask show the travel direction.
> - **Physical Train Micro-Motion**: When moving, the inner train body will bob up/down ($1.2\text{px}$ max) and lean slightly ($0.5^\circ$ max) on travel. On arrival, it will settle dynamically over $120\text{ms}$–$180\text{ms}$.
> - **Rapid Click & Resize Retargeting**: Click interruptions read `railProgressRef.current` at that instant, cancel the running RAF loop, and smoothly retarget in the new direction.

---

## Proposed Changes

### Component 1: Campaign Hub & Rail Travel System

#### [MODIFY] apps/web/components/CampaignHub.tsx

- **State & Ref Additions**:
  - `railProgressRef = useRef(0)` (scalar value from 0.0 to 1.0; the single source of truth for the current location of the train).
  - `isMovingRef = useRef(false)` (track active motion state).
  - `rafIdRef = useRef<number | null>(null)` (single RAF loop handle).
  - `desktopPathD` and `mobilePathD` states to hold dynamic SVG path representations.
- **Compute Berth Anchors and Generate Paths**:
  - Calculate desktop and mobile berth coordinates dynamically on mount and whenever the container dimensions change (ResizeObserver).
  - Berth stop points are offset horizontally/vertically from the station buttons to keep the train in its own dedicated lane.
  - Generate the SVG path data `d` connecting all 6 station berths:
    - Desktop: `M P1.x 12 L P2.x 12 L ... L P6.x 12`
    - Mobile: `M P1.x P1.y L P2.x P2.y L ... L P6.x P6.y`
  - Define mapped progress indices for each station: `stationProgress[i] = cumulativeDistanceToStation[i] / totalLength`.
- **Single RAF Clock Motion Loop**:
  - Cancel any active RAF loop on station selection.
  - Read `railProgressRef.current` as `startProgress`.
  - Calculate travel target progress `targetProgress` based on the clicked station.
  - Determine direction of travel:
    - If `targetProgress > startProgress`, set direction to `'right'` (or `'down'`).
    - If `targetProgress < startProgress`, set direction to `'left'` (or `'up'`).
  - Calculate travel duration matching timing contracts:
    - Adjacent station (1 station gap): $1350\text{ms}$.
    - Two or three stations gap: $1700\text{ms}$.
    - Longest journey (4+ stations gap): $2100\text{ms}$.
  - Run the `requestAnimationFrame` loop using `performance.now()`:
    - Calculate elapsed time fraction: $t = (\text{currentTime} - \text{startTime}) / \text{duration}$.
    - Clamp $t$ between $0$ and $1$.
    - Apply ease-in-out cubic interpolation: $f = t^2 (3 - 2t)$ or standard cubic bezier easing.
    - Interpolate progress: $p = p_{\text{start}} + (p_{\text{target}} - p_{\text{start}}) \times f$.
    - Update `railProgressRef.current = p`.
    - Retrieve coordinate: `point = pathElement.getPointAtLength(p * totalLength)`.
    - Write translation `transform: translate3d(x, y, 0)` directly to the outer train element.
    - End the loop once $t \geq 1$.
- **Resize Handling**:
  - When the track container bounds change (ResizeObserver), recalculate path geometry.
  - Continue travel from the exact current `railProgressRef.current` along the newly computed path.
- **Energy Flow & Flowing Markers**:
  - Render overlaid `<path>` elements using the track geometry.
  - Wrap them under a `<clipPath id="desktop-active-clip">` with `stroke-dasharray` defined by segment bounds ($p_{\text{min}}$ to $p_{\text{max}}$).
  - Apply `animate-flow-dash` CSS to slide the dash-offset of the markers when moving.
- **Train Micro-Motion**:
  - Add classes to the inner train container to bob it ($1.2\text{px}$) and lean it ($0.4^\circ$) during movement.
  - Smoothly transition back to default angles on arrival over $150\text{ms}$.

---

## Verification Plan

### Automated Tests
Run playwright E2E test suites to assert progress-based travel:
```bash
npx playwright test apps/web/tests/route-planner.spec.ts --config=apps/web/playwright.config.ts --project=chromium-desktop --workers=1
npx playwright test apps/web/tests/epic10.spec.ts --config=apps/web/playwright.config.ts --project=chromium-desktop --workers=1
```

Modify assertions in `apps/web/tests/epic10.spec.ts`:
- Collect at least 8 samples during the $1350\text{ms}$ adjacent transition and assert progressive distance reduction along the rail path.
- Verify rapid click interruption reads progress correctly.

### Manual Verification
- Review normal playback video files at $1366\times768$ and $390\times800$ viewports.
- Record and verify the required evidence files:
  - `evidence/epic10/07a-real-metro-single-click-glide.webm`
  - `evidence/epic10/07b-real-metro-adjacent-stations-frame-sequence.png`
  - `evidence/epic10/07c-real-metro-rail-energy-flow.webm`
  - `evidence/epic10/07d-real-metro-rapid-retarget.webm`
