# Transit Route Rules

## Inputs

- Origin: lat/lng + optional label.
- Destination: lat/lng + optional label.
- Departure time.
- Preferences: weather_aware, prefer_less_walking, prefer_fewer_transfers.

## Route scoring model

EcoTransit should not blindly accept external API order. It may re-rank candidate routes using a transparent scoring formula:

```text
base_score = 100
score -= eta_minutes * eta_weight
score -= walking_minutes * walking_weight
score -= transfer_count * transfer_weight
score -= waiting_minutes * waiting_weight

if weather is rain/heavy_rain:
  walking_weight += rain_walking_penalty
  transfer_weight += rain_transfer_penalty

if temperature is high:
  walking_weight += heat_walking_penalty

score += direct_route_bonus when transfer_count == 0
```

## Required behavior

- Return route options, not only a single option.
- Explain recommendation in Vietnamese-friendly copy.
- Include weather context when used.
- Include fare estimate when available, but label as estimate.
- Store route snapshot for later bill creation.
- Cache by origin/destination/departure-time bucket/weather bucket.

## Limitations

- Do not promise exact ETA or fare unless official/provider data supports it.
- Do not force intermediate stops through a transit provider that does not support them; split legs or use local planner later.
