# Taste Skill Agent Prompt for EcoTransit UI

Use this prompt at the start of any UI/UX implementation session.

```text
I have loaded Taste Skill v2 as frontend design rules for this project. Apply it to EcoTransit, a mobile-first public transit experience web app for young users in Ho Chi Minh City.

Brief:
- Product: EcoTransit — route planning, station guides, ticket verification rewards, vouchers, and shareable travel bills.
- Audience: 18-25 urban students/young workers, mobile-first, transit-curious, social but privacy-aware.
- Vibe words: fresh, urban, trustworthy, playful-but-useful.
- Design direction: "Saigon Transit Fresh" — teal/mint/sky surfaces, one warm reward accent, strong typographic hierarchy, tasteful motion.
- Avoid: generic SaaS gradients, three identical centered feature cards, random icon grids, dense admin tables on mobile, default browser fonts, no-state happy-path UI, over-dark dashboard shell, color-only status, fake placeholders.

Before coding:
1. Declare the design read in one sentence.
2. Declare dial values:
   - DESIGN_VARIANCE: medium to high for landing/marketing; medium for app screens; low to medium for admin.
   - MOTION_INTENSITY: medium for public app; low for admin; always respect reduced motion.
   - VISUAL_DENSITY: medium for route/station screens; low-medium for landing; medium-high only for admin desktop.
3. List existing files/components to preserve if this is a redesign.
4. List screen states: loading, empty, error, disabled, success, offline/degraded.

During coding:
- Keep one accent system per page.
- Keep one radius system per page.
- Keep theme coherent end-to-end.
- Use real layout hierarchy, not repeated card grids.
- Use tabular numerals for ETA, points, counts.
- Make mobile 390px pass before desktop polish.

After coding, report:
- Design read.
- Dials used.
- Components changed.
- Mobile check result.
- Accessibility check result.
- Anti-slop audit result.
- Screenshots or Playwright traces if available.
```

## Recommended skill install commands

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
npx skills add https://github.com/Leonxlnx/taste-skill --skill "redesign-existing-projects"
npx skills add https://github.com/Leonxlnx/taste-skill --skill "gpt-taste"
```
