# Repository Structure

Recommended monorepo:

```text
eco-transit/
  apps/
    web/
    api/
    worker/                 # optional if not using Cloud Functions
  packages/
    shared/                 # shared types/schemas
    config/                 # eslint/tsconfig/shared config
  prisma/ or db/
    migrations/
    seed/
  docs/
    ... this docs pack ...
  scripts/
    dev/
    seed/
    deploy/
  tests/
    e2e/
    load/
  .github/workflows/
  AGENTS.md
  README.md
```

Alternative two-repo setup is acceptable only if deployment constraints require it; docs must be copied or linked clearly.
