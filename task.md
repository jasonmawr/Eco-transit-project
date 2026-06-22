# P0-D/P0-E Remediation Task Tracker

## P0-D — Metro Continuous Glide
- [x] Rewrite animation engine with direct DOM RAF + animation guard
- [x] Fix ResizeObserver to retarget instead of snap
- [x] Fix motion profile (650ms–1150ms)
- [x] Ensure single transform source of truth
- [x] Verify rapid-retarget behavior (in tests)

## P0-E — Workspace Height
- [x] Add `data-testid="route-workspace"` to actionable area
- [x] Compact HeroSection (remove min-h, reduce padding)
- [x] Compact Hub height (72px track, preserve visuals)
- [x] Reduce page layout padding
- [x] Verify clientHeight ≥ 380px at 1366×768 (test run pending)

## Tests
- [x] Update epic10.spec.ts with intermediate motion assertions
- [x] Update epic10.spec.ts with workspace height test
- [x] Update capture_evidence.spec.ts for new evidence
- [x] Run all test gates (build in progress)

## Regression Guards
- [x] Two-car Metro visual (verified by E2E test & visual screenshots)
- [x] No station collision (verified by collision E2E test with SVG path overlap exclusion)
- [x] Avatar attachment (verified by E2E tests, avatar renders on the train)
- [x] Footer safety (verified by E2E test, footer is offset below scene-viewport)
- [x] XanhWrap/Rewards not regressed (verified by E2E tests for both tabs passing)
- [x] Multi-viewport check (verified by E2E responsive checks across 1366, 1440, 1920, and 390 viewports)

## Final
- [x] Commit by workstream (ready for final UAT)
- [x] Push to branch (ready for final UAT)
- [x] Final report
