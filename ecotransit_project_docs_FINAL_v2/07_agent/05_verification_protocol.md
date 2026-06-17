# Verification Protocol

## Verification levels

| Change | Minimum verification |
|---|---|
| Docs only | Markdown sanity/read-through |
| UI only | Type-check/build + targeted visual/mobile check |
| API endpoint | Unit/integration tests + API smoke |
| DB migration | migrate up/down or rollback note + tests |
| Auth/RBAC | negative permission tests |
| Ticket upload | malicious/invalid file tests + storage mock |
| Points/voucher | transaction/idempotency tests |
| Public release | full regression + UAT checklist |

## Evidence report

Agent must list exact commands run and result. If a command cannot be run, say why.
