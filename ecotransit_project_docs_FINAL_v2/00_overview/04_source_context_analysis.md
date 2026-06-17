# Source Context Analysis

## Inputs reviewed

- EcoTransit architecture PDF: product positioning, requirements, architecture, API/data model, security, deployment, testing.
- KPI project Markdown docs pack: document organization, agent-operating-system style, guardrails/checklists, prompt pack pattern.
- Taste Skill website and GitHub repository: frontend taste rules, install flow, greenfield/redesign prompts, design audit patterns.

## Useful patterns borrowed from the KPI docs pack

The KPI docs pack is valuable not because EcoTransit shares the same domain, but because it demonstrates a disciplined coding-agent handoff system:

- `AGENTS.md` at root.
- `QUICKSTART_FOR_AGENTS.md` for read order.
- Separate product, business, architecture, UX, dev, DevOps, agent, security, testing, delivery, and template folders.
- Task intake, planning, build, verification, review and ship protocols.
- Definition of done and no-regression matrices.
- Dedicated checklists for security, release, and critical business rules.
- Prompt packs for different coding agents.

## How this pack adapts that structure

EcoTransit is smaller and more consumer-facing than the KPI system, so this pack keeps the structure but shifts emphasis:

- More UI/UX and mobile-first rules.
- More privacy and UGC moderation rules.
- More external provider adapter guidance.
- More file upload/ticket verification safeguards.
- More social sharing and anti-fraud controls.

## Known unknowns to resolve before implementation

| Unknown | Why it matters | Recommended first decision |
|---|---|---|
| ORM/query builder | Affects schema/migration/testing | Prisma or Drizzle for Node/PostgreSQL |
| Hosting target | Affects auth cookies/CORS/storage | Vercel web + Cloud Run API or full Docker self-host |
| Voucher partner contract | Affects redeem flow | Treat as P1; ship manual codes/CSV first |
| Geofence boundary | Affects "administrative center" scope | Admin-configurable polygon/seed JSON |
| External route provider | Affects route quality and cost | Adapter + Google Routes implementation + mock provider |
| Ticket format | Affects OCR rules | Hybrid pipeline + manual moderation |
| Rich text editor | Affects content creation | P1; start with Markdown or simple editor |
