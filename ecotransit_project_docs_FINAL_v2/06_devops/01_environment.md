# Environment Configuration

## Required variables

| Variable | Purpose |
|---|---|
| APP_ENV | development/staging/production |
| FRONTEND_URL | Web origin |
| API_BASE_URL | API origin |
| DATABASE_URL | PostgreSQL connection |
| REDIS_URL | Redis connection |
| SESSION_SECRET | Session/JWT signing secret depending auth design |
| GOOGLE_OAUTH_CLIENT_ID | OAuth client |
| GOOGLE_OAUTH_CLIENT_SECRET | OAuth secret |
| STORAGE_PROVIDER | local/gcs/firebase/s3 |
| STORAGE_BUCKET | Object storage bucket |
| STORAGE_SERVICE_ACCOUNT_JSON | Server-side credential if needed |
| GOOGLE_MAPS_API_KEY | Maps/Routes/Places/Weather if using Google |
| FCM_SERVER_KEY_OR_CREDENTIAL | P1 push notifications |
| SENTRY_DSN | Error tracking |
| TURNSTILE_SITE_KEY | Optional anti-bot |
| TURNSTILE_SECRET_KEY | Optional anti-bot |
| VOUCHER_PARTNER_API_BASE | P1/P2 only |
| VOUCHER_PARTNER_API_KEY | P1/P2 only |

## Environment rules

- `.env.example` must not contain real secrets.
- Production secrets must be managed by platform secret manager.
- Frontend must receive only public-safe variables.
- API keys must not be logged.
