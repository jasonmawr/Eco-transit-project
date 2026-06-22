# EcoTransit Epic 10 — Integrated UAT & Migration Runbook

Tài liệu này hướng dẫn chi tiết quy trình chạy UAT tích hợp local và kịch bản chạy migration dữ liệu an toàn cho Epic 10 trên môi trường phát triển của EcoTransit.

---

## 1. Môi Trường Thử Nghiệm Local (Local Setup)

Để khởi chạy hệ thống thử nghiệm tích hợp toàn bộ các tính năng của Epic 10, thực hiện các bước sau:

### Bước 1: Khởi động cơ sở dữ liệu local và sinh dữ liệu mẫu (Seeding)
```bash
# Thực hiện migrate/reset dữ liệu local an toàn
npm run demo:reset
```
> [!WARNING]
> Lệnh `npm run demo:reset` là một lệnh phá hủy dữ liệu (destructive command) và chỉ được thực hiện trên môi trường phát triển local. Hệ thống đã được tích hợp chốt chặn an toàn (hard safety guard) trong `scripts/demo-reset.ts` để chặn và dừng thực thi ngay lập tức nếu phát hiện host/database/provider là Neon hoặc production.

*Lưu ý:* Cơ chế seed mới sẽ tự động verify email cho các tài khoản Admin/Moderator và Demo để không khóa quyền truy cập của họ. Đồng thời tạo alias ngẫu nhiên không trùng lặp cho ví điểm xanh của họ.

### Bước 2: Khởi động các Dev Server trong chế độ song song
```bash
# Khởi động cả API (cổng 3001) và Web Frontend (cổng 3000)
npm run dev
```

---

## 2. Kịch Bản UAT Tích Hợp (Integrated UAT Flow)

Trong môi trường phát triển local hoặc testing, hệ thống hoạt động ở chế độ mock email khi không cấu hình SMTP trong biến môi trường `.env`. Tuy nhiên, trong môi trường Production (`NODE_ENV=production`), nếu thiếu bất kỳ biến cấu hình SMTP nào (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`), hệ thống sẽ chặn và trả về lỗi HTTP `503` (`SMTP_NOT_CONFIGURED`) khi người dùng đăng ký hoặc yêu cầu gửi lại email xác thực, đồng thời xóa sạch dữ liệu đăng ký dư thừa để đảm bảo an toàn tuyệt đối.

### Luồng A: Xác thực tài khoản mới & Onboarding Avatar
1. Truy cập trang chủ [http://localhost:3000](http://localhost:3000).
2. Click button **Đăng nhập** ở góc phải header, chọn tab **Đăng ký**.
3. Nhập email mới và mật khẩu, nhấn **Đăng ký tài khoản**.
4. Hệ thống đăng ký thành công và tự động đăng nhập. Ở phía trên trang chủ sẽ xuất hiện **Verification Alert Banner** màu cam thông báo tài khoản chưa xác thực.
5. Kiểm tra terminal của API Server hoặc tệp `last-mock-email.json` ở thư mục gốc dự án để lấy link xác thực mock. Định dạng link dạng:
   `http://localhost:3000/verify-email?token=<mockToken>`
6. (Tùy chọn) Nhấn **Gửi lại email xác thực** trên banner. Do tính năng cooldown chống spam, hệ thống sẽ chặn và hiển thị thông báo yêu cầu đợi 60 giây (mã lỗi 429).
7. Copy link xác thực ở bước 5 dán vào thanh địa chỉ trình duyệt để truy cập.
8. Trang xác thực hiển thị thông báo **Xác thực thành công!**. Nhấn **Thiết lập Avatar nhân vật** để điều hướng về trang chủ và kích hoạt modal Onboarding Avatar.
9. Chọn một trong các nhân vật (Học sinh, Dân văn phòng, Người khám phá, v.v.). Lựa chọn này được lưu trữ cả ở `localStorage` và đồng bộ hóa server-side.
10. Banner màu cam báo chưa xác thực sẽ hoàn toàn biến mất trên trang chủ.

### Luồng B: Chuyển trạm metro & Hiệu ứng Tàu Metro trên Hub
1. Tại bản đồ hành trình Hub ở đầu trang chủ, click nhanh liên tiếp vào các ga khác nhau (Lộ trình, Khám phá ga, Tích điểm, Đổi thưởng, XanhWrap).
2. Tàu metro 🚇 sẽ di chuyển mượt mà (Spring animation) từ ga cũ đến ga mới đã chọn.
3. Chỉnh chế độ hệ điều hành hoặc trình duyệt sang **Prefers-Reduced-Motion**. Kiểm tra lại: chuyển trạm sẽ cập nhật vị trí nhân vật tức thì mà không chạy hoạt họa tàu metro trượt dài, bảo vệ trải nghiệm tiếp cận.

### Luồng C: Tạo XanhWrap (Minigame mới)
1. Chọn chặng ga **XanhWrap / Chia sẻ** hoặc điều hướng trực tiếp bằng thanh nav.
2. Nhập các thông tin bắt buộc:
   - *Biệt danh/Nickname*
   - *Thời gian đi (Phút)*: Nhập `0` hoặc `1441` để thử validate, hệ thống hiển thị thông báo lỗi tiếng Việt thân thiện. Nhập số hợp lệ (ví dụ: `45`).
   - *Số may mắn dự thi (1-999)*: Nhập `1000` để thử validate lỗi. Nhập số hợp lệ (ví dụ: `777`).
   - *Khoảnh khắc di chuyển*: Nhập tự do (tối đa 55 ký tự).
3. Nhấn **Tạo XanhWrap 🎫**. Hệ thống tính toán greenScore, lưu trữ xuống database một cách an toàn và tạo TimeBill.
4. Preview thẻ chia sẻ (TimeBillCard) xuất hiện bên phải, hiển thị thông tin Nickname cùng con số may mắn dạng `#777`.
5. Truy cập liên kết chia sẻ công khai có cấu trúc dạng `/share/<shareSlug>` để kiểm tra. Bản ghi hiển thị công khai đầy đủ nội dung, đồng thời ẩn toàn bộ thông tin cá nhân nhạy cảm như email hay userId để bảo mật tuyệt đối.

---

## 3. Quy Trình Chạy Migration An Toàn & Tránh Khóa Tài Khoản Cũ

### Cơ Chế Bảo Vệ Dữ Liệu
Để tránh việc thêm cột `emailVerified` làm khóa toàn bộ tài khoản đang hoạt động, quy trình migration được thực hiện theo chiến lược an toàn 5 bước (Không sử dụng blanket update `false` -> `true` trong production):

1. **Thêm trường nullable tạm thời**:
   - Thêm cột `emailVerified` là BOOLEAN không có ràng buộc NOT NULL hoặc DEFAULT.
   - Script SQL tương ứng:
     ```sql
     ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN;
     ```
2. **Backfill tài khoản cũ**:
   - Cập nhật tất cả các tài khoản đang tồn tại tại thời điểm chạy migration thành `true`.
   - Script SQL tương ứng:
     ```sql
     UPDATE "User" SET "emailVerified" = true WHERE "emailVerified" IS NULL;
     ```
   - Điều này giúp bảo toàn trạng thái đăng nhập cho tài khoản Demo/Admin/Moderator và các người dùng hiện hữu.
3. **Thiết lập Default cho tài khoản mới**:
   - Cấu hình DEFAULT `false` cho các tài khoản đăng ký sau khi hoàn thành migration:
     ```sql
     ALTER TABLE "User" ALTER COLUMN "emailVerified" SET DEFAULT false;
     ```
4. **Áp dụng ràng buộc NOT NULL**:
   - Thiết lập thuộc tính NOT NULL sau khi đã backfill dữ liệu trống:
     ```sql
     ALTER TABLE "User" ALTER COLUMN "emailVerified" SET NOT NULL;
     ```
5. **Cấu hình Token**:
   - Các trường token xác thực (`verificationTokenHash`, `verificationTokenExpires`, `verificationSentAt`) được giữ ở trạng thái nullable.

> [!CAUTION]
> Tuyệt đối không sử dụng lệnh blanket update:
> ```sql
> -- CẤM SỬ DỤNG LỆNH NÀY TRONG PRODUCTION
> UPDATE "User" SET "emailVerified" = true WHERE "emailVerified" = false;
> ```
> vì nó sẽ vô tình kích hoạt trạng thái xác thực cho các tài khoản mới đăng ký nhưng chưa thực sự hoàn thành việc xác thực qua email.

---

## 4. Hướng Dẫn Vận Hành Script Backfill Alias Cho Ví Điểm Xanh

Sau khi thêm trường `publicLeaderboardAlias` độc lập nhằm ẩn danh bảng xếp hạng, toàn bộ ví điểm xanh cũ của người dùng (nếu có) bị trống cột alias.

Chúng tôi cung cấp script vận hành độc lập, chạy một lần và có cơ chế idempotent (có thể chạy lại nhiều lần mà không làm hỏng dữ liệu):
`scripts/backfill-leaderboard-alias.ts`

### Hướng dẫn thực thi:

* Chạy chế độ **Dry-run** (Chỉ quét và báo cáo, không ghi xuống database):
  ```bash
  npx ts-node scripts/backfill-leaderboard-alias.ts --dry-run
  ```

* Chạy thực tế (Quét, tự động tạo alias ngẫu nhiên an toàn chống đụng độ P2002 và cập nhật dữ liệu):
  ```bash
  npx ts-node scripts/backfill-leaderboard-alias.ts
  ```

*Báo cáo kết quả:* Script sẽ in ra chi tiết số lượng bản ghi: Scanned, Created, Skipped, Collision Retry, Remaining Null.

---

## 5. Kịch Bản Rollback Môi Trường Production (Phòng ngừa sự cố)

Trong trường hợp phát hiện lỗi blocker nghiêm trọng trên môi trường staging/production sau khi triển khai, việc rollback phải tuân thủ quy trình an toàn nghiêm ngặt và phải được **Owner phê duyệt**:

1. **Vercel Rollback**:
   - Truy cập Vercel Dashboard, chọn project `web`.
   - Tìm bản build/deployment stable đã được phê duyệt gần nhất và thực hiện **Redeploy** hoặc **Promote to Production** bản build đó.
   - Không thực hiện checkout code hay merge nóng trên production.

2. **Render Rollback**:
   - Truy cập Render Dashboard, chọn service `api`.
   - Tiến hành redeploy commit stable đã được kiểm định trước đó.

3. **Neon Rollback**:
   - Khôi phục trạng thái database từ Restore Point đã được tạo trước khi bắt đầu deploy (hoặc từ bản sao lưu / branch backup của Neon).
   - **Không chạy lệnh down migration hủy hoại dữ liệu (destructive down migration) trực tiếp** trên Neon production trong thời gian xảy ra sự cố.
   - **Không thực hiện drop columns** ngay lập tức để phục vụ rollback trừ khi thực sự cần thiết và đã có sự phê duyệt/backup hoàn chỉnh.
