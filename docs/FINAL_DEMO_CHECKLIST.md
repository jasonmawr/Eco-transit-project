# Danh Sách Kiểm Tra Trình Diễn Cuối Cùng (Final Demo Checklist) — Lướt Khói Chạm Xanh — EcoTransit

Tài liệu này cung cấp toàn bộ checklist kiểm thử kỹ thuật và kịch bản vận hành chi tiết để người vận hành (Operator) có thể tự tay kiểm chứng toàn bộ hệ thống trước và trong khi trình diễn sản phẩm.

---

## 1. Cổng Kiểm Tra Kỹ Thuật (Build & Test Gates)

Trước khi đem hệ thống đi trình diễn, hãy đảm bảo các lệnh sau chạy thành công tại máy cục bộ (môi trường Windows PowerShell):

### 1.1. Dọn Dẹp & Biên Dịch Tĩnh (Clean & Build Gate)
Dọn dẹp các thư mục cache `.next` cũ để đảm bảo không có lỗi biên dịch tĩnh và tiến hành build monorepo:
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\web\.next -ErrorAction SilentlyContinue
npm run build
```
- [ ] Lệnh build kết thúc thành công với mã trả về `$LASTEXITCODE = 0`.
- [ ] Tệp `apps\web\.next\BUILD_ID` tồn tại (Chứng minh Next.js build hoàn tất):
  ```powershell
  Test-Path apps\web\.next\BUILD_ID
  ```

### 1.2. Kiểm Thử Tích Hợp (Test Suite Gate)
Chạy toàn bộ bài test kiểm thử tích hợp tự động cho Express API, Config, Security, Rewards, TimeBill và Admin Console:
```powershell
npm run test
```
- [ ] Toàn bộ **test suite** hiển thị màu xanh và vượt qua (Pass 100%).

### 1.3. Liveness/Readiness Probe Gate
Chạy thử máy chủ cục bộ và gửi truy cập liveness/readiness probe:
1. Chạy dev server:
   ```powershell
   npm run dev
   ```
2. Gửi request probe trong tab PowerShell mới:
   ```powershell
   Invoke-WebRequest http://localhost:3001/healthz -UseBasicParsing
   Invoke-WebRequest http://localhost:3001/readyz -UseBasicParsing
   ```
- [ ] `/healthz` trả về mã trạng thái `200 OK` kèm JSON: `{"status":"ok", ...}`.
- [ ] `/readyz` trả về mã trạng thái `200 OK` kèm JSON: `{"status":"ready", ...}`.
3. Tắt dev server sau khi hoàn tất kiểm tra:
   ```powershell
   Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

---

## 2. Danh Sách Kiểm Tra Quyền Riêng Tư (Privacy Audit Checklist)

Đảm bảo các điều kiện an toàn thông tin sau được đáp ứng tại giao diện người dùng công khai (Public UI):

- [ ] **Không lộ thông tin nhạy cảm của người dùng**: Không hiển thị địa chỉ Email, mật khẩu, userId, hay UUID thô trên màn hình công khai cho khách hoặc người dùng khác.
- [ ] **Không lộ đường dẫn thư mục vật lý máy chủ**: Không hiển thị các chuỗi đường dẫn tệp tin (ví dụ: `D:\Projects\...` hoặc `/usr/src/app/...`) trên bất kỳ màn hình công khai nào.
- [ ] **Nhận dạng ẩn danh thân thiện**: Khi nhận xét ga không có tên hiển thị, tên mặc định hiển thị là **"Hành khách xanh"** thay vì các giá trị `null`, `undefined` hoặc chuỗi rỗng.
- [ ] **Không lộ mã Voucher công khai**: Voucher khi chưa được đổi chỉ hiển thị nút "Đổi ngay", không để lộ mã code (VD: `LX-ABCD-1234`) ra ngoài danh mục public. Chỉ khi người dùng bấm đổi và bị trừ điểm thành công thì mã code tương ứng mới hiển thị trong Ví voucher cá nhân của họ.
- [ ] **Không hiển thị stack trace lỗi**: Khi xảy ra lỗi API (ví dụ: lỗi 500), giao diện chỉ hiện thông báo lỗi tiếng Việt thân thiện, không in toàn bộ stack trace kỹ thuật của Node.js/Express.

---

## 3. Kịch Bản Trình Diễn Thủ Công Dành Cho Người Vận Hành (Manual Browser Checklist)

*Người vận hành tự mở trình duyệt (ví dụ: Chrome hoặc Edge) truy cập trang web cục bộ `http://localhost:3000` hoặc trang deploy thực tế và thực hiện tuần tự theo kịch bản Happy Path dưới đây:*

### Bước 3.1. Kịch Bản Trải Nghiệm Gamified App Shell & Chọn Nhân Vật (Campaign Hub & Character Selection)
- [ ] Mở trang chủ EcoTransit. Giao diện phải hiển thị gọn gàng bao gồm Hero ngắn, Panel chọn nhân vật và bản đồ Campaign Hub 6 chặng (dạng đường tàu điện metro trực quan).
- [ ] Tại góc phải của Hub, nhấn vào nút chọn nhân vật đồng hành. Chọn 1 trong 5 nhân vật (ví dụ: **Dân văn phòng lướt khói** 💼). Xác minh rằng popup đóng lại, và avatar 💼 xuất hiện đứng ở vị trí ga đầu tiên (Lập lộ trình).
- [ ] Tải lại trang (F5). Xác minh nhân vật đồng hành vẫn duy trì là **Dân văn phòng lướt khói** 💼 (lưu trữ thành công qua `localStorage`).
- [ ] Click thử vào chặng số 4 (**Đổi thưởng**). Xác minh trang web hiển thị **chuyển cảnh 3D lật trang/giấy** đẹp mắt sang scene Đổi thưởng nằm trong SceneViewport, các chặng khác không hiển thị cùng lúc.
- [ ] Xác nhận URL hiển thị hash `#rewards`. Reload lại trang (F5) và xác nhận hệ thống tự động tải đúng scene Đổi thưởng đầu tiên mà không mất trạng thái nhân vật đồng hành.

### Bước 3.2. Kịch Bản Tìm Tuyến & Chia Sẻ Hóa Đơn (Commuter / Guest Flow)
- [ ] Tại Campaign Hub, click chặng số 1 (**Lập lộ trình xanh**).
- [ ] Chọn **Ga xuất phát** (ví dụ: Ga Bến Thành) và **Ga đến** (ví dụ: Ga Thảo Điền) sử dụng Combobox tìm kiếm không dấu.
- [ ] Chọn nhiều điều kiện thời tiết cùng lúc (ví dụ: `Trời mưa lớn` + `Trời tối`) và kiểm tra xem chip mô tả có cập nhật khuyến nghị tự nhiên: "Ưu tiên Metro có mái che, hạn chế đi bộ trơn trượt. Lộ trình buổi tối đơn giản, an toàn, ít chuyển tuyến."
- [ ] Nhấn nút **"🚀 Tìm kiếm lộ trình xanh"**.
- [ ] Xem chi tiết chặng di chuyển chi tiết bằng cách click **"▼ Chi tiết hành trình"**.
- [ ] Nhấn nút **"Tạo hóa đơn lướt khỏi khói"** 🎫.
- [ ] Xác minh hóa đơn hiển thị đẹp mắt với điểm xanh, CO₂ giảm thiểu, và số tiền tiết kiệm.
- [ ] Sao chép liên kết chia sẻ của hóa đơn (Ví dụ: `/share/lx-...`).
- [ ] Mở một tab ẩn danh mới của trình duyệt, dán liên kết vừa copy vào.
- [ ] Xác minh trang share tải dữ liệu thành công, hiển thị chính xác Time Bill mà không yêu cầu đăng nhập và không để lộ thông tin nhạy cảm.

### Bước 3.3. Kịch Bản Tải Vé Xe & Tích Điểm Xanh (Commuter Flow)
- [ ] Quay lại trang chính, nhấp chọn **"Đăng nhập"** (hoặc click nút đăng nhập nhanh ở phần ví).
- [ ] Click nút **"Trải nghiệm nhanh bằng tài khoản Demo"** (tự điền `user@ecotransit.vn` / `User@123456`) và nhấn đăng nhập.
- [ ] Nhấp chọn chặng số 3 (**Tích điểm vé xanh**).
- [ ] Chọn loại phương tiện (ví dụ: Metro hoặc Xe buýt) và nhập tên tuyến xe.
- [ ] Chọn một tệp ảnh chụp vé xe xanh thực tế (định dạng JPG/PNG/WEBP, kích thước nhỏ hơn 2MB, không nhận SVG).
- [ ] Nhấn **"Gửi vé xanh tích điểm"**.
- [ ] Xác minh vé vừa tải xuất hiện trong danh sách bên phải ở trạng thái màu vàng **"Chờ kiểm duyệt"** kèm tooltip giải thích Kiểm duyệt viên/Quản trị viên sẽ kiểm tra vé trước khi cộng điểm.

### Bước 3.4. Kịch Bản Phê Duyệt & Ghi Nhận Kiểm Toán (Moderator Flow)
- [ ] Nhấn **"Đăng xuất"** tài khoản người dùng ở góc phải header.
- [ ] Bấm đăng nhập lại bằng tài khoản Kiểm duyệt viên: `moderator@ecotransit.vn` / mật khẩu `Moderator@123456`.
- [ ] Cuộn xuống cuối trang, xác minh bảng điều khiển **"Admin/Moderator Console"** đã xuất hiện.
- [ ] Nhấp chọn Tab **"Vé xanh"**, tìm chiếc vé vừa được tài khoản user tải lên ở bước trước.
- [ ] Click **"Phê duyệt"** vé. Hệ thống ghi vết vào Audit Log và cộng đúng **+10 điểm** (Khớp với quy tắc 1 vé = 10 điểm của khách hàng).
- [ ] Nhấp chuyển sang Tab **"Nhật ký kiểm toán"** (Audit Logs) để kiểm tra xem hành động duyệt vé của bạn đã được ghi lại rõ ràng trong lịch sử hệ thống hay chưa.

### Bước 3.5. Kịch Bản Đổi Điểm Thưởng Voucher (Commuter Flow)
- [ ] Đăng xuất tài khoản moderator, đăng nhập lại bằng tài khoản `user@ecotransit.vn`.
- [ ] Nhấp chọn chặng số 4 (**Đổi thưởng**).
- [ ] Kiểm tra số dư điểm xanh tại ví: điểm đã được cộng thêm đúng **10 điểm** từ chiếc vé được duyệt ở bước trước.
- [ ] Kiểm tra danh mục quà tặng: Mỗi voucher hiển thị cả điểm và số vé tương đương (ví dụ: Voucher Highlands Coffee 19,000 VND hiển thị `60 điểm` và `~ 6 vé xanh`).
- [ ] Chọn một voucher và nhấn **"Đổi ngay"**.
- [ ] Trên popup xác nhận, kiểm tra bảng tính trừ điểm và số vé quy đổi tương đương dự kiến rồi bấm **"Đồng ý đổi điểm"**.
- [ ] Nhận mã code ưu đãi hiển thị rõ ràng trên màn hình.
- [ ] Nhấn nút **"Xem ví voucher của tôi"** để xác nhận voucher đã được đưa vào kho voucher cá nhân an toàn.

### Bước 3.6. Kịch Bản Tạo XanhWrap Thủ Công (Commuter Flow)
- [ ] Nhấp chọn chặng số 5 (**XanhWrap**).
- [ ] Điền thông tin vào biểu mẫu thủ công:
  - Nickname: `Hùng Lâm`
  - Điểm xuất phát: `Bến Thành`
  - Điểm đến: `Thảo Điền`
  - Thời gian đi: `20 phút`
  - Khoảnh khắc di chuyển: `Buổi sáng đi làm`
- [ ] Nhấp **"Tạo XanhWrap 🎫"**.
- [ ] Xác minh thẻ XanhWrap hiển thị đẹp mắt bên phải với các thông tin đã điền và chỉ số xanh ước tính kèm disclaimer.
- [ ] Bấm nút **"Sao chép link chia sẻ"** hoặc **"Sao chép caption chia sẻ"** để kiểm tra tính năng chia sẻ kèm hashtag `#XanhWrap`, `#LuotKhoiChamXanh`, `#EcoTransit`.

### Bước 3.7. Kịch Bản Cẩm Nang Xanh (Commuter Flow)
- [ ] Nhấp chọn chặng số 6 (**Cẩm nang lướt xanh**).
- [ ] Xác minh danh sách cẩm nang được hiển thị đầy đủ dưới dạng card. Click vào một cẩm nang bất kỳ để đọc chi tiết trên cửa sổ popup.
- [ ] Xác minh khu vực placeholder video feed ở bên phải hiển thị rõ thông báo: *"Video/Feed chiến dịch sẽ được cập nhật khi có tư liệu production."* một cách sạch sẽ và không gây lỗi console.
