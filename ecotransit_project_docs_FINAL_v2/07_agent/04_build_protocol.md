# Build Protocol

## General

- Make small coherent changes.
- Keep business rules in backend/domain services.
- Keep UI components reusable.
- Update tests near changed code.
- Update docs when behavior changes.

## DB changes

- Generate migration.
- Add tests for invariants.
- Update `03_architecture/03_database_design.md` if schema materially changes.

## UI changes

- Load Taste Skill prompt/rules.
- Implement responsive mobile-first.
- Add states.
- Run UI quality gate.

## External integration changes

- Add adapter interface and mock.
- Add timeout/error mapping.
- Add tests without requiring real provider keys.
