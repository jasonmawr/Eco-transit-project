# Task Intake Protocol

Before coding, agent must classify the request.

## Required questions to answer internally

- What user/business problem does this task solve?
- Which module owns the change?
- Is it P0/P1/P2?
- Which docs are source-of-truth?
- Does it touch DB schema?
- Does it touch auth/session/RBAC/ownership?
- Does it touch file upload/OCR/storage?
- Does it touch points/voucher/ledger?
- Does it touch public UI or admin UI?
- What test evidence is required?

## Intake output

Agent plan must include:

- Scope.
- Non-scope.
- Files likely to change.
- Acceptance criteria.
- Test plan.
- Risks.
