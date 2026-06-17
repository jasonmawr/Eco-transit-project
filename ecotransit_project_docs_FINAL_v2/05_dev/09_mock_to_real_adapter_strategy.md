# Mock-to-Real Adapter Strategy

## Why

Provider keys and official data may not be available on day one. The app must still be buildable without lying to production users.

## Environments

| Env | Providers |
|---|---|
| local | seeded stations/routes, mock weather, mock OCR, local storage or emulator |
| staging | real map/routing if keys available, test bucket, OCR can be stubbed with flag |
| production | real providers or approved fallback with visible estimation labels |

## Rules

1. Mock providers must be explicit and environment-gated.
2. Production cannot silently use mock OCR for awarding points.
3. Production can use seeded station/route data if UI labels it as estimated/reference data.
4. Tests should run against deterministic adapters.
5. Provider adapters must expose health/status.
