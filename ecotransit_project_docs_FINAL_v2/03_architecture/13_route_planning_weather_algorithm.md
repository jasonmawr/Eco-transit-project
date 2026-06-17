# Route Planning and Weather Algorithm

## Inputs

- origin/destination lat/lng/label.
- departure time.
- user preferences: fewer transfers, less walking, cheaper route, accessible route.
- weather context: condition, temperature, precipitation probability, UV/heat category if available.
- transit route candidates from provider or local fallback.
- station/POI metadata for enrichment.

## Weather buckets

| Bucket | Condition |
|---|---|
| `normal` | no rain, moderate temperature |
| `rain` | rain or precipitation probability >= 60% |
| `heavy_rain` | heavy rain or probability >= 80% |
| `hot` | temperature >= 33°C or heat index high |
| `night` | departure after configured evening threshold |

## Scoring model

Base score starts at 100 and subtracts penalties:

```text
score = 100
  - eta_penalty
  - walking_penalty
  - transfer_penalty
  - waiting_penalty
  - fare_penalty
  - weather_penalty
  + preference_bonus
```

## Penalty rules

- Long ETA penalty: gradual penalty beyond fastest option.
- Walking penalty: normal = 1x, rain = 2x, heavy_rain = 3x, hot = 2x.
- Transfer penalty: rain/night increases penalty.
- Waiting penalty: high for exposed outdoor waits if station metadata says no shelter.
- Fare penalty: low priority unless user selects cheaper route.

## Output

Sort by score, then ETA, then walking time, then transfers. Always return explanation in Vietnamese:

- “Trời đang có khả năng mưa, tuyến này ít đi bộ hơn.”
- “Tuyến này nhanh nhất nhưng phải đổi tuyến nhiều hơn.”
- “Tuyến này phù hợp nếu bạn muốn đi bộ ít.”

## Fallback behavior

If weather API fails, route search still works and UI shows: “Chưa có dữ liệu thời tiết, gợi ý dựa trên thời gian và quãng đi bộ.”

If route provider fails but local seed has metro route, return local metro-only estimate with warning.
