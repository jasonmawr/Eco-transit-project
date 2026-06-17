# Product Privacy Rules

## Data minimization

Collect only what the feature needs:

- Route search can run without account.
- Quiz can run without account.
- Guest bill can be temporary.
- Ticket upload requires account because points and abuse controls require identity.
- UGC requires account for moderation and accountability.

## Bill privacy

Default bill privacy level: `station_only`.

| Privacy level | Public content |
|---|---|
| masked | General area only, no precise times/locations |
| station_only | Station/stop names or broad area, no exact coordinates |
| full_public | More details only after explicit user choice |

## Sensitive location handling

- Do not expose exact coordinates of home/work origin/destination in public share.
- Do not include full travel history in public bill.
- Use random share slugs.
- Allow user to disable public bill if implemented.

## Image privacy

- Ticket images are private by default.
- UGC images are private until approved if linked to UGC.
- Access to images should be through expiring signed URL or protected proxy.

## Consent/copy

Use clear Vietnamese copy:

- "Ảnh vé chỉ dùng để xác minh chuyến đi và cộng điểm."
- "Bill chia sẻ mặc định chỉ hiển thị ở mức ga/khu vực, không hiển thị tọa độ chính xác."
- "Review sẽ được duyệt trước khi công khai."
