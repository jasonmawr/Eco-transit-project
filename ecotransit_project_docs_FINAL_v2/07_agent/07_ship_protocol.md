# Ship Protocol

## Ship report format

```text
Summary
- What changed.

Files changed
- path: purpose

Verification
- command: result

Acceptance criteria
- Pass/fail list

Risks and assumptions
- Remaining concerns

Rollback
- How to revert/disable

Next step
- Recommended follow-up
```

## No-ship conditions

- Tests not run and no valid reason.
- UI quality gate failed for UI changes.
- Security checklist failed for security-sensitive changes.
- Migration has no rollback note.
- Provider dependency has no mock/fallback.
