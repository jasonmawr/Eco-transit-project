# Non-Functional Requirements Matrix

| ID | Requirement | Target | Gate |
|---|---|---|---|
| NFR-001 | Mobile-first | 390px no overflow; primary flows usable one-handed | Playwright/screenshot review |
| NFR-002 | Accessibility | Keyboard navigation, visible focus, semantic labels, contrast | axe/manual checklist |
| NFR-003 | Route latency | p95 < 2.5s under normal provider conditions | k6/smoke metrics |
| NFR-004 | Upload latency | Valid image request accepted < 3s | integration/load test |
| NFR-005 | Bill generation | p95 < 1.5s | integration/load test |
| NFR-006 | Availability | Health endpoints and graceful provider fallback | smoke test |
| NFR-007 | Security | OWASP API/file-upload/auth/session baseline | security checklist |
| NFR-008 | Privacy | Minimized bill sharing and private raw ticket storage | privacy test cases |
| NFR-009 | Observability | request_id, structured logs, error tracking, metrics | ops checklist |
| NFR-010 | Backup/restore | DB backup and restore drill documented | runbook test |
| NFR-011 | Data integrity | Transactional points/voucher operations | tests |
| NFR-012 | Maintainability | Modular folders, adapters, typed DTOs, no giant components | code review |
| NFR-013 | UI quality | Taste Skill anti-slop pass on all public screens | UI gate |
| NFR-014 | Localization | i18n keys no hard-coded critical public labels | code review/test |
| NFR-015 | SEO/social | Title/meta/OG for public pages and bill share | smoke test |
