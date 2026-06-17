# Load and Security Baseline

## Load targets

- 20 concurrent users for campaign-like peak smoke.
- p95 `/api/v1/routes/search` < 2.5s when provider/mock healthy.
- p95 `/api/v1/bills` < 1.5s.
- Upload request accepted < 3s, verification async.

## Security baseline

- Auth endpoints rate-limited.
- Upload endpoints rate-limited.
- IDOR tests pass.
- CSRF strategy documented for cookie auth.
- XSS protection for UGC/rich text.
- File upload rejects malicious extensions and mismatched MIME.
- Admin endpoints protected.
