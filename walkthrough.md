# Walkthrough — Completed Batches (Batch 01 to Batch 09)

Tài liệu ghi nhận chi tiết kết quả triển khai, bàn giao và kiểm chứng kỹ thuật qua toàn bộ các Batch của chiến dịch **Lướt Khói Chạm Xanh — EcoTransit**.

---

## 1. Summary of Changes

### Batch 01 — Core Route Planner & Station Map
- **Dijkstra Engine**: Xây dựng thuật toán tìm tuyến tối ưu (`LocalRouteProvider.ts`) tích hợp weather-presets và preferences.
- **Frontend Mobility Cockpit**: Form tìm kiếm, Leaflet Map vẽ route, và Vertical timeline hành trình xanh.

### Batch 01D-HF1/HF2 — UI Hotfixes & Brand Alignment
- **Brand Identity**: Đồng bộ typography, logo và 4 màu thương hiệu: Electric Blue, Vibrant Green, Urban Beige, Dark Charcoal.
- **Premium Motion**: Tích hợp các chuyển động mượt mà của `framer-motion` cho Header, Dropdown, Hero Background, và CTA button.

### Batch 02 — Station Experience & UGC Foundation
- **UGC Reviews**: CSDL `UGCReview` & `Place` xung quanh các nhà ga.
- **Station Experience UI**: Cụm tab hiển thị Địa điểm ăn chơi, Review hành khách, và Cẩm nang du lịch xanh.

### Batch 03 — Ticket Upload & Green Points Ledger
- **Jimp Image Optimization**: Resize và nén ảnh vé xe khách dưới 500KB bằng Jimp, lọc EXIF metadata.
- **Upload Protection**: Chặn SVG, chặn file rỗng, và cơ chế SHA-256 duplicate detection chống spam vé.
- **Points Ledger**: Nhật ký điểm cộng dồn, ví tiền và lịch sử giao dịch điểm xanh.

### Batch 04 — Rewards / Voucher Wallet
- **Voucher Redemption**: Giao dịch đổi điểm trừ ví, giảm kho (stock), sinh mã code `LX-...` bảo mật, hỗ trợ Idempotency.

### Batch 05 — Moderator/Admin Console
- **Audit Logs**: Ghi vết lịch sử phê duyệt. Bảng điều khiển admin quản lý POI, cẩm nang, voucher và duyệt vé.

### Batch 06 — Time Bill Generator & Social Share
- **Public Share**: Tạo liên kết chia sẻ hóa đơn `/share/lx-...` công khai, bảo mật thông tin nhạy cảm.

### Batch 07 — Deployment Readiness
- **Neon + Render + Vercel**: Khởi tạo cấu hình cookie cross-site (`secure: true`, `sameSite: "none"`), trust proxy, và database connection pooler.

### Batch 08 — Final QA / UAT / Polish
- **Static Assets & Console Cleanup**: Tự động sinh placeholder voucher và xử lý toàn bộ lỗi thẻ SVG/Hydration trên console.

### Batch 09 — Customer USER FLOW Alignment & Gamified App Shell
- **Gamified Campaign Hub**: Redesign giao diện trang chủ thành sơ đồ 6 ga chặng Metro hoạt họa trực quan.
- **Avatar Selection**: Cho phép người dùng chọn nhân vật đồng hành (💼, 🎒, 🚴,...) và lưu trạng thái qua `localStorage`.
- **Collapsible Section Layout**: Các khu chức năng tự động thu gọn/mở rộng khi click ga chặng, giữ giao diện gọn gàng giống ứng dụng di động.
- **XanhWrap Manual Form**: Bổ sung form nhập tay hành trình để nhận XanhWrap card kèm caption và hashtag truyền thông nhanh (#XanhWrap #LuotKhoiChamXanh #EcoTransit).
- **Milestones 1 vé = 10 điểm**: Căn chỉnh đồng bộ tỷ lệ điểm thưởng trên backend và UI (mốc 3/6/9/99 vé tương ứng 30/60/90/990đ).

---

## 2. Verification Outcomes

### Root Build Status
Quy trình biên dịch monorepo hoàn thành xuất sắc, tạo build tĩnh Next.js sạch sẽ:
- `npm run build` $\rightarrow$ **Success** (`$LASTEXITCODE = 0`).
- Tệp `apps/web/.next/BUILD_ID` được tạo thành công.

### Integration Test Suite (Vitest)
Toàn bộ **93/93** bài kiểm thử tích hợp tự động (Dijkstra routing, UGC reviews, ticket upload, points ledger, rewards redemption, admin console) đều vượt qua:
```bash
 Test Files  7 passed (7)
      Tests  93 passed (93)
   Start at  12:23:47
   Duration  12.57s
```

### Health & Readiness Probes
Các đầu kiểm tra liveness và readiness phản hồi `200 OK` nhanh chóng:
- `/healthz` $\rightarrow$ `{"status":"ok"}`
- `/readyz` $\rightarrow$ `{"status":"ready", "database":"connected"}`

---

## 3. Demo / Placeholder Features (Client Handoff Notes)

Để bảo đảm tính độc lập và chi phí vận hành bằng 0:
1. **Social Sharing**: Hệ thống sử dụng nút sao chép caption kèm hashtag thay cho Facebook/Zalo SDK thật.
2. **Video Feed**: Mục cẩm nang sử dụng thẻ thông báo placeholder thay cho API video để tránh spam console.
3. **Mock OCR**: Hệ thống giả lập trích xuất vé bằng metadata tệp mà không gọi API OCR trả phí.
4. **Render Ephemeral Storage**: Ảnh vé lưu tạm thời cục bộ trên Render, dữ liệu DB trên Neon giữ nguyên vẹn.
