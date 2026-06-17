# Definition of Done

A task is done only when:

- Code compiles.
- Relevant tests pass.
- New behavior has tests where practical.
- UX states are complete for touched screens.
- Mobile does not overflow.
- Security/privacy implications reviewed.
- Documentation updated when source-of-truth changes.
- Agent report includes evidence and rollback note.

## Feature-specific DoD

### Route search

- Mock provider tests.
- Weather scoring tests.
- Cache behavior or documented non-cache for local.
- Error/degraded UI.

### Ticket upload

- File validation tests.
- Storage mock tests.
- Status transition tests.
- Idempotent points award tests.
- Moderator decision tests.

### Voucher redeem

- Insufficient points test.
- Quantity zero test.
- Atomic transaction test.
- Duplicate redeem policy test.

### Bill share

- Privacy level tests.
- Share URL/text response.
- Public view masks sensitive data.
- Copy fallback UI.
