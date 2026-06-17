# Error Code Catalog

All user-facing messages must be Vietnamese-friendly. Do not leak raw stack traces, enum names or provider responses.

| Code | HTTP | User message intent |
|---|---:|---|
| AUTH_REQUIRED | 401 | Vui lòng đăng nhập để tiếp tục |
| AUTH_FORBIDDEN | 403 | Bạn không có quyền thực hiện thao tác này |
| SESSION_EXPIRED | 401 | Phiên đăng nhập đã hết hạn |
| VALIDATION_ERROR | 400 | Dữ liệu chưa hợp lệ, highlight field |
| ROUTE_PROVIDER_UNAVAILABLE | 503 | Chưa thể tìm tuyến, thử lại hoặc dùng gợi ý gần nhất |
| ROUTE_NO_RESULT | 404 | Chưa tìm thấy tuyến phù hợp |
| WEATHER_UNAVAILABLE | 200/partial | Vẫn trả route, nhưng không có weather score |
| TICKET_FILE_INVALID | 400 | Ảnh vé không đúng định dạng/kích thước |
| TICKET_DUPLICATE | 409 | Ảnh vé có dấu hiệu trùng |
| TICKET_LOW_CONFIDENCE | 202 | Vé cần kiểm tra thủ công |
| POINTS_INSUFFICIENT | 409 | Điểm chưa đủ để đổi quà |
| VOUCHER_SOLD_OUT | 409 | Quà đã hết lượt đổi |
| VOUCHER_EXPIRED | 409 | Quà đã hết hạn |
| REVIEW_PENDING | 202 | Nội dung đang chờ duyệt |
| BILL_NOT_PUBLIC | 403/404 | Bill không công khai hoặc đã bị ẩn |
| RATE_LIMITED | 429 | Bạn thao tác hơi nhanh, thử lại sau |
| INTERNAL_ERROR | 500 | Hệ thống gặp lỗi, kèm request_id |
