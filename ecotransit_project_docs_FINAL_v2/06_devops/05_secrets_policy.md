# Secrets Policy

## Secrets are forbidden in

- Source code.
- Markdown docs.
- Test snapshots.
- Frontend bundles.
- Logs.
- Issue comments/screenshots.

## Handling

- Use `.env.example` with placeholder values.
- Use platform secret manager for staging/production.
- Rotate leaked secrets immediately.
- Restrict provider keys by domain/IP/service where possible.
- Separate staging and production credentials.

## Logging redaction

Redact:

- Authorization headers.
- Cookies.
- OAuth codes.
- Refresh/session tokens.
- API keys.
- Storage signed URLs where possible.
- Voucher codes before redemption.
