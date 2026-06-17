# Agent Operating System

## Standard lifecycle

```text
Input task
→ Context gathering
→ Define acceptance criteria
→ Impact analysis
→ Plan
→ Build
→ Verify
→ Self-review
→ Report
→ Update docs if needed
```

## Task severity

| Severity | Examples | Required rigor |
|---|---|---|
| Light | Copy changes, doc typos | Minimal plan, quick verify |
| Standard | UI component, small endpoint | Plan, tests/lint, self-review |
| Strict | DB, external integration, workflow | Impact analysis, tests, rollback note |
| Critical | Auth, RBAC, points, voucher, upload security, privacy | ADR/design note, threat review, owner approval |

## Required report format

```text
Summary
Files changed
Behavior changed
Tests run
Risks/assumptions
Rollback notes
Next recommended step
```
