# Design System

## Brand tokens

### Colors

| Token | Suggested value | Use |
|---|---|---|
| `--color-primary` | `#00A88F` | Main CTA, active route, brand highlights |
| `--color-primary-deep` | `#087D72` | Hover/pressed, deep headers |
| `--color-mint-bg` | `#EAF8F4` | Soft background panels |
| `--color-sky-bg` | `#EAF5FF` | Route/weather panels |
| `--color-coral` | `#FF7A59` | Rewards, warm accent, limited use |
| `--color-amber` | `#F5A524` | Warning, manual review |
| `--color-success` | `#16A34A` | Verified/success |
| `--color-danger` | `#DC2626` | Rejected/errors |
| `--color-ink` | `#10201D` | Main text |
| `--color-muted` | `#66736F` | Secondary text |
| `--color-surface` | `#FFFFFF` | Cards |
| `--color-page` | `#F8FBFA` | App background |

Rules:
- One main accent per screen.
- Do not use rainbow status chaos.
- Use semantic colors with text/icon labels.

### Typography

Recommended:
- Display/headings: `Satoshi`, `Outfit`, `Cabinet Grotesk`, or `Geist`.
- Body: `Inter`, `Geist`, or system sans.
- Data/ETA/points: enable `font-variant-numeric: tabular-nums`.

Scale:

| Token | Mobile | Desktop | Use |
|---|---:|---:|---|
| Display | 36-44 | 56-72 | Landing hero |
| H1 | 28-34 | 40-48 | Page title |
| H2 | 22-28 | 30-36 | Section title |
| Body | 15-16 | 16-17 | Readable copy |
| Caption | 12-13 | 12-14 | Meta labels |

### Radius

| Token | Value | Use |
|---|---:|---|
| `--radius-sm` | 8px | Inputs/badges |
| `--radius-md` | 14px | Cards |
| `--radius-lg` | 24px | Hero panels/bottom sheets |
| `--radius-pill` | 999px | Pills/chips only |

### Spacing

Use 4px base grid:

- xs 4
- sm 8
- md 16
- lg 24
- xl 32
- 2xl 48
- 3xl 72

### Motion

- Route result cards: staggered fade/slide 120-220ms.
- Bottom sheet: spring-like but not bouncy excess.
- Verification status: subtle progress/stepper transitions.
- Bill card: gentle reveal, no blocking animation.
- Respect `prefers-reduced-motion`.

## Component inventory

```text
components/
  shell/
    AppShell
    MobileNav
    TopBar
  route/
    RouteSearchBox
    RouteOptionCard
    WeatherReasonPill
    RouteLegTimeline
    MapPanel
  station/
    StationHeader
    NearbyGuideCard
    ReviewCard
  ticket/
    TicketUploader
    VerificationStatusBadge
    TicketTimeline
  points/
    PointsBalanceCard
    PointsLedgerTable
    VoucherCard
  bill/
    BillComposer
    BillPreviewCard
    ShareActions
  moderation/
    ModerationQueueTable
    DecisionDrawer
  common/
    EmptyState
    ErrorState
    LoadingSkeleton
    ConfirmDialog
```
