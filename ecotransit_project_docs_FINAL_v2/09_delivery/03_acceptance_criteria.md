# Final Acceptance Criteria

## Product acceptance

EcoTransit is accepted when:

1. It satisfies all P0 and P1-required requirements in `01_product/06_complete_functional_requirements_matrix.md`.
2. It clearly equals or exceeds the HCMC Metro benchmark in `00_overview/03_hcmc_metro_benchmark_and_gap_analysis.md`.
3. It demonstrates complete end-to-end journeys for route planning, discovery, ticket points, reward redemption, UGC moderation and time bill sharing.
4. It includes admin UI for all normal moderation/content/voucher operations.

## UI acceptance

- Public UI passes Taste Skill anti-slop review.
- Required screenshots exist.
- Mobile 390px is polished and usable.
- No generic boilerplate look.
- Vietnamese copy is consistent.

## Security/privacy acceptance

- No localStorage auth token.
- Raw ticket images private.
- Role + ownership checks enforced.
- Points/vouchers transactional.
- UGC moderation prevents unapproved public content.
- Time bill masks sensitive locations by default.

## Technical acceptance

- Clean build.
- Tests pass.
- Health/readiness pass.
- Migrations run cleanly on empty DB.
- Seed data makes demo usable.
- Backup/restore and rollback documented.

## Customer signoff

Customer signs off using `08_testing/05_uat_script_customer_signoff.md` or logs change requests in `09_delivery/05_change_control.md`.
