# Migrations and Schema Guards

## Migration rules

- Every schema change must have a migration file.
- Migration name must be descriptive.
- Breaking changes require data migration plan.
- Every migration PR must include rollback note.
- Do not edit already-applied migrations unless project is pre-release and owner approves.

## Data integrity guards

- Unique idempotency indexes for points awards.
- Transaction locks for voucher quantity and point deduction.
- Foreign keys for critical relationships.
- Check constraints where supported:
  - `quantity_remaining >= 0`
  - `points_cost >= 0`
  - `rating between 1 and 5`
  - `delta != 0`

## Migration checklist

- [ ] Migration generated.
- [ ] Local migrate pass.
- [ ] Seed pass.
- [ ] Tests pass.
- [ ] Rollback note written.
- [ ] API/types updated.
- [ ] Docs updated if domain model changed.
