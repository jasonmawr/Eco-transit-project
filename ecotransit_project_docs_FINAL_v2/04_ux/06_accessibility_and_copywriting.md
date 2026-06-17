# Accessibility and Copywriting

## Accessibility

- WCAG AA contrast for text and interactive elements.
- Keyboard navigable forms/buttons/modals/drawers.
- Visible focus states.
- Labels for all inputs.
- `aria-live` or status announcements for upload/verification changes where appropriate.
- Respect `prefers-reduced-motion`.
- Do not use color only for status; include labels/icons.

## Vietnamese microcopy style

Tone:
- Friendly, clear, short.
- Avoid technical provider errors.
- Avoid blame.

Examples:

| Situation | Copy |
|---|---|
| Upload accepted | "Ảnh vé đã được nhận. EcoTransit sẽ xác minh và báo lại cho bạn." |
| Manual review | "Vé cần được kiểm tra thêm trước khi cộng điểm." |
| Rejected duplicate | "Ảnh vé này có dấu hiệu đã được sử dụng trước đó." |
| Weather route | "Trời đang có khả năng mưa, EcoTransit ưu tiên tuyến ít đi bộ hơn." |
| Bill privacy | "Bill mặc định chỉ hiển thị ở mức ga/khu vực, không hiển thị tọa độ chính xác." |
| Provider unavailable | "Chưa lấy được dữ liệu lộ trình lúc này. Thử lại sau ít phút nhé." |

## Error copy rules

- User-facing message must be friendly Vietnamese.
- Internal code can be machine-readable but not shown as primary text.
- No raw stack trace, GUID-only text, provider JSON, or database errors.
