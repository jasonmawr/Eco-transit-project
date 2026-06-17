# Taste Skill Final Operating Guide

## Purpose

Taste Skill is required to reduce generic AI frontend output. Use it as a design-quality operating method for all public-facing screens.

## Required installation/reference

Agent should reference:

```bash
npx skills add Leonxlnx/taste-skill
```

If the agent environment cannot install it, it must still follow the written Taste Skill principles from `04_ux/10_premium_ui_art_direction.md` and report why installation was skipped.

## Required Taste Skill workflow

Before coding UI:

1. State the visual brief.
2. State design dials:
   - density: medium.
   - personality: modern/urban/eco/youth.
   - motion: purposeful, not flashy.
   - layout: map-first, mobile-first.
   - color: emerald/mint/sky with reward accent.
3. Identify anti-slop risks.
4. Build the component/screen.
5. Run screenshot self-review.
6. Fix spacing/typography/overflow before final report.

## Required UI report section

Every UI batch final report must include:

```text
Taste Skill / UI Quality Report
- Visual brief followed:
- Design dials used:
- Anti-slop issues checked:
- Mobile screenshots captured:
- Accessibility issues found/fixed:
- Remaining UI risks:
```

## Immediate failure conditions

- Public UI looks like a generic admin dashboard.
- Route planner is not usable on mobile.
- Cards are misaligned or inconsistent.
- Important CTAs are hidden below excessive hero decoration.
- Map controls overlap bottom sheet with no escape.
- Vietnamese text truncates critical instructions.
