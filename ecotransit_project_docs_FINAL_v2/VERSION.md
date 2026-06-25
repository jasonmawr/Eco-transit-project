# EcoTransit Project Docs — FINAL v2.1

- **Version:** FINAL v2.1
- **Date:** 2026-06-25
- **Status:** Release Candidate 2 - Verified diagnostic and mail provider hotfixes
- **Scope status:** Complete with SMTP diagnostics, Brevo HTTPS Mail integration, error obfuscation rules, and Playwright E2E browser tests.

## What changed from v2.0 (Mail & Diagnostic Hotfixes)

1. **Provider Selection Model**: Added a configurable `MAIL_PROVIDER` environment variable allowing seamless switching between local mock, standard SMTP, and Brevo HTTPS transactional email delivery.
2. **Harden Mail Diagnostics**: Added recursion-bounded error analyzer (depth limit 5) to safely classify incoming transport errors (`AggregateError` or nested `.cause`) without exposing stack traces in production/demo modes.
3. **Frontend Cooldown Restoration**: Fixed false cooldown triggers by ensuring client UI countdowns are only initiated for HTTP 429 response codes, keeping failed resends (HTTP 503) safe from lockouts.
4. **E2E Browser Test Integration**: Integrated Playwright browser-based verification suites verifying registration, email verification flows, responsive constraints, and Metro motion.

## What changed from v1

1. Added HCMC Metro benchmark and explicit “better-than-HCMC-Metro” parity/exceed matrix.
2. Removed open-ended `Unspecified` decisions by locking recommended implementation choices.
3. Expanded final PRD, functional matrix, non-functional matrix, business rules and acceptance criteria.
4. Added premium UI art direction, screen-by-screen specs, motion rules, responsive screenshot gate and Taste Skill workflow.
5. Added implementation batches and ready-to-paste coding-agent prompts.
6. Added final UAT, traceability, customer signoff and release gate documents.

## Important truth

This document set is the source of truth for the current requirement baseline. Future customer changes, new official transit API changes, new voucher partner contracts or legal/policy changes must enter through the change-control process in `09_delivery/05_change_control.md`.
