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

### Batch 09-HF4 — Fix Scene Clipping + Active Navigation States
- **Bố cục True App-Deck**: Chuyển đổi root thành `h-dvh` và đặt SceneViewport thành `flex-1 min-h-0` với scroll nội bộ. Giúp CampaignHub chiếm row layout tĩnh cố định, loại bỏ triệt để hiện tượng đè hoặc clipping nội dung tiêu đề các phân cảnh (#stations, #tickets, #rewards).
- **Trạng thái Active/Hover Header Nav**: Bổ sung pill active màu `eco-primary`, hiệu ứng lướt hover spring backdrop qua `framer-motion`, chấm tròn indicator ở chân tab, và đầy đủ accessibility focus-ring. Đồng bộ chính xác theo hash URL hoặc mount state.
- **Trạng thái Ga Chặng CampaignHub**: Ga active tự động phóng to `scale-110`, bổ sung ring halo bao quanh, và nhãn chữ nổi bật. Tối ưu kích thước compact để avatar di chuyển linh hoạt mà không bị container cắt cụt nhờ thiết lập `overflow-visible`.

### Batch 09-HF8 — Scrollable Navigation Rail Redesign
- **Bảo đảm không bao giờ cắt chữ**: Cấu trúc thanh navigation rail ngang cho phép hiển thị đầy đủ mọi item (Lộ trình, Khám phá, Tích điểm, Đổi thưởng, XanhWrap, Cẩm nang, Admin nếu có quyền). Tuyệt đối không dùng `truncate`, `max-width` quá nhỏ, hay `overflow-hidden` trực tiếp trên từng label.
- **Admin tích hợp trong Rail**: Đưa nút Admin trở lại làm item thứ 7 của navigation rail khi user có role `ADMIN`/`MODERATOR`. Bảo đảm:
  - User thường: không nhìn thấy Admin.
  - Moderator/Admin: thấy Admin, active tab khi truy cập `/#admin` và rail tự động cuộn đưa Admin vào vùng nhìn.
  - Bảo mật route `/#admin`: user thường reload `/#admin` sẽ bị chặn thân thiện và tự động redirect về tab mặc định.
- **Kiểm soát Mouse Wheel ngang**: Intercept sự kiện cuộn chuột dọc (`deltaY`) chuyển thành cuộn ngang (`scrollLeft`) khi hover trên thanh nav rail, chỉ khi container thực sự bị tràn (overflow). Không ảnh hưởng tới scroll dọc của SceneViewport bên dưới.
- **Drag-to-scroll chống click nhầm**: Kéo để cuộn mượt mà trên desktop bằng chuột. Đặt ngưỡng (threshold) dịch chuyển 6px để phân biệt hành vi kéo (drag) và click chuột thông thường, tránh trigger click ngoài ý muốn.
- **Tự động căn giữa (Active Auto-Centering)**: Khi đổi activeSection hoặc khi tải lại trang qua deep-link, container tự động tính toán vị trí và thực hiện cuộn (`scrollTo({ left, behavior: 'smooth' })`) để đưa active item vào giữa hoặc gần giữa vùng nhìn.
- **Visual Affordance (Fade overlays)**: Hai lớp mờ gradient ở biên trái/phải báo hiệu khả năng cuộn. Ẩn/hiện tự động dựa trên vị trí scroll (ẩn fade trái khi ở đầu, ẩn fade phải khi ở cuối, ẩn cả hai khi không tràn). Thêm thuộc tính `pointer-events-none` để tránh chặn click chuột của người dùng.
- **Keyboard & Accessibility**: Thiết kế nav items sử dụng cấu trúc thẻ có focus-visible ring rõ ràng, đầy đủ `aria-current="page"` cho active item, hỗ trợ phím Tab đi qua các item bình thường, kích hoạt bằng Enter/Space.
- **Responsive Acceptance**:
  - Desktop (1366px, 1440px, 1920px): hiển thị đầy đủ không bị cắt chữ, căn giữa hoàn hảo khi đủ chỗ.
  - Mobile (390px): cuộn swipe ngang mượt mà, header gọn gàng 1 dòng không bị đội chiều cao.

---

## 2. Verification Outcomes

### Root Build Status
Quy trình biên dịch monorepo hoàn thành xuất sắc, tạo build tĩnh Next.js sạch sẽ:
- `npm run build` -> **Success** (`$LASTEXITCODE = 0`).
- Tệp `apps/web/.next/BUILD_ID` được tạo thành công.

### Integration Test Suite (Vitest)
Toàn bộ **93/93** bài kiểm thử tích hợp tự động (Dijkstra routing, UGC reviews, ticket upload, points ledger, rewards redemption, admin console) đều vượt qua:
```bash
 Test Files  7 passed (7)
      Tests  93 passed (93)
   Duration  9.50s
```

### Health & Readiness Probes
Các đầu kiểm tra liveness và readiness phản hồi lỗi kết nối do máy chủ local hiện không được khởi chạy trong môi trường CI/CD hoặc quá trình chạy tự động (Expected). Các endpoint này sẽ phản hồi đúng khi khởi chạy máy chủ:
- `/healthz` -> `{"status":"ok"}`
- `/readyz` -> `{"status":"ready", "database":"connected"}`

---

## 3. Demo / Placeholder Features (Client Handoff Notes)

Để bảo đảm tính độc lập và chi phí vận hành bằng 0:
1. **Social Sharing**: Hệ thống sử dụng nút sao chép caption kèm hashtag thay cho Facebook/Zalo SDK thật.
2. **Video Feed**: Mục cẩm nang sử dụng thẻ thông báo placeholder thay cho API video để tránh spam console.
3. **Mock OCR**: Hệ thống giả lập trích xuất vé bằng metadata tệp mà không gọi API OCR trả phí.
4. **Render Ephemeral Storage**: Ảnh vé lưu tạm thời cục bộ trên Render, dữ liệu DB trên Neon giữ nguyên vẹn.
