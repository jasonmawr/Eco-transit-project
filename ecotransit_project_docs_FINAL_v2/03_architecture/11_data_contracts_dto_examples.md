# Data Contracts and DTO Examples

## API envelope

```json
{
  "data": {},
  "meta": {
    "request_id": "req_01J...",
    "timestamp": "2026-06-15T10:00:00+07:00"
  },
  "error": null
}
```

## Error envelope

```json
{
  "data": null,
  "meta": { "request_id": "req_01J..." },
  "error": {
    "code": "TICKET_DUPLICATE",
    "message": "Ảnh vé này có dấu hiệu đã được sử dụng. Vui lòng gửi ảnh khác hoặc chờ nhân sự kiểm tra.",
    "details": {}
  }
}
```

## Route option DTO

```json
{
  "route_id": "route_opt_01",
  "title": "Ít đi bộ khi trời mưa",
  "summary": "Đi bộ 3 phút → Bus 45 → Metro số 1 → Đi bộ 2 phút",
  "eta_minutes": 34,
  "walking_minutes": 5,
  "waiting_minutes": 7,
  "transfer_count": 1,
  "fare_estimate": { "min": 14000, "max": 25000, "currency": "VND" },
  "weather_score": 91,
  "recommendation_reason": "Dự báo có mưa, tuyến này giảm quãng đi bộ và hạn chế đổi tuyến.",
  "legs": [
    { "mode": "WALK", "duration_minutes": 3, "from_label": "Vị trí hiện tại", "to_label": "Trạm bus gần nhất" },
    { "mode": "BUS", "line_code": "45", "duration_minutes": 12 },
    { "mode": "METRO", "line_code": "M1", "from_station_id": "st_benthanh", "to_station_id": "st_bason", "duration_minutes": 8 }
  ]
}
```

## Ticket verification DTO

```json
{
  "ticket_id": "tkt_001",
  "verification_status": "manual_review",
  "verification_score": 0.64,
  "reasons": ["OCR chưa đủ rõ", "Cần xác nhận ngày đi"],
  "points_preview": 0
}
```

## Bill DTO

```json
{
  "bill_id": "bill_001",
  "share_slug": "b-7KQ82M",
  "privacy_level": "station_only",
  "summary": {
    "total_minutes": 34,
    "walking_minutes": 5,
    "waiting_minutes": 7,
    "transfer_count": 1,
    "weather_label": "Mưa nhẹ"
  },
  "share_url": "https://app.ecotransit.vn/b/b-7KQ82M"
}
```
