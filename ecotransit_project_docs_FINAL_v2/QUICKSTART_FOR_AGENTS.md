# Quickstart for Coding Agents

## 0. Do not code before reading

Read:

```text
AGENTS.md
README.md
00_overview/00_FINAL_EXECUTIVE_BRIEF.md
00_overview/03_hcmc_metro_benchmark_and_gap_analysis.md
01_product/01_PRD.md
01_product/06_complete_functional_requirements_matrix.md
03_architecture/10_final_stack_lock.md
04_ux/10_premium_ui_art_direction.md
04_ux/11_screen_by_screen_final_specs.md
04_ux/15_taste_skill_final_operating_guide.md
07_agent/prompt_pack/00_MASTER_BUILD_PROMPT_FINAL.md
08_testing/06_traceability_matrix.md
09_delivery/03_acceptance_criteria.md
```

## 1. Initial implementation sequence

1. Batch 00 — Repo, environment, DB, auth skeleton, health.
2. Batch 01 — Station/route seed, map shell, station detail, HCMC Metro parity screens.
3. Batch 02 — Route planner: bus + metro + weather-aware scoring.
4. Batch 03 — Content, guide/video, nearby places, review/UGC moderation.
5. Batch 04 — Ticket upload, OCR verification, points ledger.
6. Batch 05 — Rewards/voucher redemption and notifications.
7. Batch 06 — Time bill, social share, OG card, privacy controls.
8. Batch 07 — Admin console, analytics, audit log, operational readiness.
9. Batch 08 — Premium UI polish, Taste Skill pass, responsive screenshots.
10. Batch 09 — Full regression, load/security baseline, UAT, release.

## 2. First response expected from agent

Before changing files, respond with:

```text
I have read the final docs. I will start with Batch XX.
Scope:
Non-scope:
Files expected:
DB impact:
Security impact:
UI impact:
Test plan:
Rollback plan:
Questions/blockers:
```

Questions are allowed only for true missing business data. Do not ask for things already decided in docs.
