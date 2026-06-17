# Test Strategy

## Test layers

| Layer | Tool suggestion | Scope |
|---|---|---|
| Unit | Vitest/Jest | scoring, rules, validators, formatters |
| Integration | Test DB + API tests | auth, tickets, points, voucher redeem, moderation |
| E2E | Playwright | guest route, login, upload, bill, admin queues |
| Load | k6 | route search, upload accept, bill create |
| Security baseline | ZAP/manual checklist | XSS, CSRF, IDOR, upload abuse |
| UAT | Manual | mobile-first product flows |

## Minimum automated coverage by module

- Route scoring unit tests.
- Weather scoring edge cases.
- Ticket file validation tests.
- Ticket state transitions.
- Idempotent points award.
- Voucher redeem transaction tests.
- Ownership negative tests.
- Bill privacy tests.
- Review moderation visibility tests.
