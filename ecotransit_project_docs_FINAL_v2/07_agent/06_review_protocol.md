# Review Protocol

## Self-review checklist

- [ ] Feature matches PRD and business rules.
- [ ] No raw secrets or tokens.
- [ ] No token in localStorage.
- [ ] Ownership checks exist for resource-by-id endpoints.
- [ ] Tests cover happy and negative paths.
- [ ] UI states exist.
- [ ] Mobile 390px considered.
- [ ] Logs do not leak sensitive data.
- [ ] Docs updated if needed.

## Critical review triggers

Human/owner review required for:

- Auth/session changes.
- RBAC changes.
- File upload security changes.
- Points/voucher/redeem logic.
- Privacy behavior of bills.
- Production deployment/secrets.
