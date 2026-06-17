# Master Build Prompt — EcoTransit FINAL

Paste this to the coding agent.

```text
You are the senior coding agent for EcoTransit. Build the product as a production-grade modern web app, not a demo.

Before coding, read:
- AGENTS.md
- QUICKSTART_FOR_AGENTS.md
- README.md
- 00_overview/00_FINAL_EXECUTIVE_BRIEF.md
- 00_overview/03_hcmc_metro_benchmark_and_gap_analysis.md
- 00_overview/05_final_scope_lock_and_assumptions.md
- 01_product/01_PRD.md
- 01_product/06_complete_functional_requirements_matrix.md
- 03_architecture/10_final_stack_lock.md
- 03_architecture/13_route_planning_weather_algorithm.md
- 03_architecture/14_points_ledger_algorithm.md
- 04_ux/09_hcmc_metro_better_than_benchmark.md
- 04_ux/10_premium_ui_art_direction.md
- 04_ux/11_screen_by_screen_final_specs.md
- 04_ux/15_taste_skill_final_operating_guide.md
- 08_testing/06_traceability_matrix.md
- 09_delivery/03_acceptance_criteria.md

Final objective:
Create EcoTransit as a better-than-HCMC-Metro experience platform with map-first route planning, bus+metro route options, weather-aware recommendations, station/nearby discovery, reviews/guides, content/video, ticket upload points, rewards, time bill sharing, admin moderation, audit, security and production gates.

Non-negotiables:
- No token in localStorage.
- No public raw ticket images.
- No points without immutable ledger and transaction.
- No voucher redemption without idempotent transactional guard.
- No public UGC before moderation.
- No generic AI-looking UI.
- Apply Taste Skill UI quality workflow and capture screenshots.
- Tests required for critical rules.

Start by proposing the first implementation batch with scope, non-scope, files, DB impact, security impact, UI impact, test plan and rollback plan. Do not code until the plan is accepted.
```
