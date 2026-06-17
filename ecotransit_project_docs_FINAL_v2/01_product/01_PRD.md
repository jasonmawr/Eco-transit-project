# Product Requirements Document — EcoTransit FINAL

## 1. Vision

EcoTransit helps young HCMC users confidently use public transport by combining route planning, weather context, station discovery, social sharing and rewards.

## 2. Personas

| Persona | Need |
|---|---|
| First-time metro user | Wants simple route guidance, fare/time estimate and confidence around stations |
| Student/young commuter | Wants cheap, fast, weather-aware travel and rewards |
| Explorer | Wants cool cafés, places and guides near stations |
| Content contributor | Wants to share reviews/guides and earn recognition |
| Moderator/admin | Needs to verify tickets, moderate content, manage vouchers and keep data clean |

## 3. Core user journeys

### Journey A — Guest route planning

1. User opens home/map.
2. Enters origin/destination or uses current location.
3. System returns route options with bus/metro/walking legs.
4. Weather badge explains why a route is recommended.
5. User opens route detail, station details and nearby places.
6. User can create temporary time bill or sign in to save/share.

### Journey B — Discover near station

1. User selects a station.
2. System shows POIs by category, distance and guide/review context.
3. User opens place detail.
4. User reads guide/review or navigates with map.
5. Signed-in user can post review/guide, pending moderation.

### Journey C — Ticket to points

1. User signs in.
2. Uploads bus/metro ticket photo and minimal metadata.
3. System stores file privately and creates ticket with pending verification.
4. Async job validates, OCRs, scores and checks duplicates.
5. Verified ticket creates immutable points ledger.
6. User receives notification.

### Journey D — Redeem reward

1. User opens rewards wallet.
2. Selects voucher.
3. System validates inventory, expiry and points balance.
4. Transaction deducts points and issues code.
5. User sees redemption history.

### Journey E — Time bill share

1. User selects a route/trip.
2. Creates time bill with privacy level default `station_only`.
3. System creates share URL and card.
4. Browser native share is used when available; otherwise copy link / social fallback.

## 4. Success metrics

| Metric | Target for first release |
|---|---|
| Route search success rate | >= 95% under normal provider availability |
| p95 route search latency | < 2.5s excluding provider outages |
| Ticket upload accepted latency | < 3s for valid images |
| Bill generation p95 | < 1.5s |
| UGC moderation leakage | 0 public unapproved UGC |
| Points ledger consistency | 0 negative unexplained balances |
| Mobile critical screens | No horizontal overflow at 390px |

## 5. Release completeness

Release is complete only when every `P0` and `P1-required` item in `01_product/06_complete_functional_requirements_matrix.md` is implemented or explicitly waived by the project owner.
