# Frontend Guidelines

## Stack

- Next.js + React + TypeScript recommended.
- TanStack Query or equivalent for server state.
- React Hook Form + Zod for forms if selected.
- Tailwind, CSS modules, or design system CSS acceptable, but tokens must be centralized.

## Rules

- Do not put official business rules only in frontend.
- Frontend can preview route/score display, but backend is source of truth for persisted decisions.
- No token in localStorage.
- Use API client with typed response envelope.
- Implement route guards based on server session/me endpoint.
- All screens must have loading/empty/error states.
- Long forms preserve user input.
- Dangerous actions require confirmation.

## Component rules

- Use domain components instead of raw repeated JSX.
- Use friendly labels for statuses.
- Use tabular numerals for route/points counts.
- Avoid default browser styling.
- Avoid repeated identical card grids.

## Suggested folders

```text
src/
  app/ or pages/
  components/
    route/
    station/
    ticket/
    points/
    bill/
    moderation/
    common/
  lib/
    apiClient.ts
    auth.ts
    labels.ts
    formatters.ts
  styles/
    tokens.css
```
