# Kịch Bản Trình Diễn & Vận Hành Demo (Runbook) — Lướt Khói Chạm Xanh — EcoTransit

Tài liệu này hướng dẫn các bước khởi động, kiểm thử tính sẵn sàng và các bước thực hiện kịch bản trình diễn (Happy Path) của dự án **Lướt Khói Chạm Xanh — EcoTransit** sau khi đồng bộ hóa quy trình người dùng (USER FLOW).

---

## 1. Khởi Động & Kiểm Tra Sẵn Sàng (Verification)

### 1.1. Chạy Máy Cục Bộ (Local Development)
1. Cấu hình tệp `.env` tại thư mục gốc dựa theo `.env.example`.
2. Khởi chạy song song cả ứng dụng Frontend Next.js và Backend Express:
   ```powershell
   npm run dev
   ```
3. Truy cập kiểm tra API liveness/readiness cục bộ:
   - `http://localhost:3001/healthz` (Phản hồi 200 OK)
   - `http://localhost:3001/readyz` (Phản hồi 200 OK kết nối DB)

### 1.2. Kiểm Tra Môi Trường Triển Khai Thực Tế (Production Deployed)
1. Truy cập trực tiếp địa chỉ API Render để đánh giá tính sẵn sàng:
   `https://<ten-dich-vu-api>.onrender.com/readyz`
2. Truy cập địa chỉ Frontend Vercel để tương tác giao diện:
   `https://<ten-trang-web>.vercel.app`
3. Nếu Render API đang ngủ (do chính sách Free Tier idle 15 phút), trang web sẽ tự động hiển thị biểu ngữ cảnh báo **"Đang Kết Nối Máy Chủ - Waking Up"**. Hãy chờ khoảng 50-90 giây để máy chủ khởi động hoàn tất trước khi thao tác tiếp.

---

## 2. Danh Sách Tài Khoản Trình Diễn (Dành Cho Đánh Giá Viên)

Dưới đây là các tài khoản kiểm thử đã được nạp sẵn thông tin giao dịch qua mã lệnh seeding:

| Vai Trò | Tên Tài Khoản (Email) | Mật Khẩu | Nội Dung Trình Diễn / Kiểm Thử |
| :--- | :--- | :--- | :--- |
| **Người Đi Lại (USER)** | `user@ecotransit.vn` | `User@123456` *(Tài khoản seeding cục bộ)* | Trải nghiệm chọn nhân vật, lập lộ trình, tích điểm vé xanh (1 vé = 10đ), tự tạo XanhWrap và đổi voucher theo mốc vé. |
| **Kiểm Duyệt Viên (MODERATOR)** | `moderator@ecotransit.vn` | `Moderator@123456` *(Tài khoản seeding cục bộ)* | Duyệt / từ chối các phản hồi đánh giá ga (UGC Reviews) và duyệt ảnh chụp vé xe khách gửi lên. Mặc định cộng 10 điểm khi duyệt. |
| **Quản Trị Viên (ADMIN)** | `admin@ecotransit.vn` | `Admin@123456` *(Tài khoản seeding cục bộ)* | Xem nhật ký kiểm toán (Audit Logs), cấu hình danh mục voucher, POI và cẩm nang di chuyển. |

---

## 3. Kịch Bản Trình Diễn Từng Bước (Happy Path Demonstration)

### Bước 3.1. Chọn Nhân Vật Đồng Hành & Khám Phá Campaign Hub
1. Ngay khi vào trang chủ EcoTransit, bạn sẽ được chào đón bởi bảng điều khiển **Campaign Journey Hub** mô phỏng bản đồ ga tàu điện.
2. Bấm vào nút **"Nhân vật đồng hành"** ở góc phải của Hub.
3. Chọn một nhân vật ưa thích (ví dụ: **Dân văn phòng lướt khói** 💼). Xác minh rằng avatar 💼 của bạn xuất hiện ngay trên tuyến đường tàu điện ở vị trí ga đầu tiên.
4. Tải lại trang (F5) để kiểm nghiệm rằng avatar của bạn được duy trì không mất.

### Bước 3.2. Tìm Kiếm Tuyến Đường (Commuter / Guest Flow)
1. Tại Hub, bấm vào ga số 1 (**Lập lộ trình xanh**). Xác minh trang web hiển thị **chuyển cảnh 3D lật trang/giấy** đẹp mắt chuyển sang scene Lập lộ trình trong SceneViewport.
2. Nhập thông tin ga đi và ga đến (ví dụ: xuất phát từ ga **Bến Thành** đi ga **Thảo Điền**).
3. Chọn điều kiện thời tiết (ví dụ: `Trời mưa lớn` + `Trời tối`) để xem khuyến nghị thời tiết bằng tiếng Việt tự nhiên.
4. Nhấn nút **"🚀 Tìm kiếm lộ trình xanh"**.
5. Click nút **"▼ Chi tiết hành trình"** của một tuyến cụ thể để xem biểu đồ chi tiết.
6. Nhấn nút **"Tạo hóa đơn lướt khỏi khói"** 🎫 để sinh hóa đơn thời gian di chuyển xanh độc đáo hiển thị chỉ số, CO₂ giảm thiểu và số tiền tiết kiệm, sao chép liên kết chia sẻ dạng `https://<site-url>/share/lx-...` để kiểm tra trang công khai trên tab ẩn danh.

### Bước 3.3. Tải Vé Xe & Tích Điểm Xanh (Commuter Flow)
1. Nhấn nút **"Đăng nhập"** trên Header, sử dụng nút đăng nhập nhanh của tài khoản người dùng Demo (`user@ecotransit.vn` / `User@123456`).
2. Nhấp chọn ga số 3 (**Tích điểm vé xanh**).
3. Chọn loại vé (ví dụ: `metro`) và nhập thông tin. Chọn một tệp ảnh vé xe xanh hợp lệ (JPG/PNG/WEBP < 2MB).
4. Nhấn **"Gửi vé xanh tích điểm"**. Vé của bạn sẽ được gửi và hiển thị ở trạng thái **Chờ kiểm duyệt** (màu vàng). Hệ thống cũng hiển thị thông tin giải thích quy trình đối soát thủ công trước khi cộng điểm.

### Bước 3.4. Phê Duyệt Dữ Liệu & Cộng Điểm Mặc Định (Moderator Flow)
1. Đăng xuất tài khoản user, đăng nhập bằng tài khoản moderator `moderator@ecotransit.vn` / mật khẩu `Moderator@123456`.
2. Cuộn xuống cuối trang chủ để mở bảng điều khiển **Moderator Console**.
3. Chọn Tab **"Vé xanh"**, tìm chiếc vé do tài khoản user tải lên ở bước trước và nhấn **"Phê duyệt"**.
4. Chuyển sang Tab **"Nhật ký kiểm toán"** để kiểm chứng hành động duyệt vé được ghi vết rõ ràng.

### Bước 3.5. Quy Đổi Điểm Thưởng Theo Mốc Vé Xanh (Commuter Flow)
1. Đăng xuất tài khoản moderator, đăng nhập lại bằng tài khoản `user@ecotransit.vn`.
2. Chọn ga số 4 (**Đổi thưởng**).
3. Kiểm tra số dư ví điểm xanh: số điểm xanh của bạn đã được cộng chính xác **10 điểm** từ chiếc vé được duyệt ở bước trước.
4. Tại danh sách voucher, bạn sẽ thấy điểm đổi quà hiển thị cả điểm và số vé tương đương (ví dụ: Voucher Phúc Long 30k hiển thị `90 điểm ~ 9 vé xanh`).
5. Bấm **"Đổi ngay"** một voucher Phúc Long hoặc Highlands và hoàn tất đổi mã.

### Bước 3.6. Chia Sẻ XanhWrap Thủ Công (Commuter Flow)
1. Bấm vào ga số 5 (**XanhWrap**).
2. Điền các thông tin trong biểu mẫu thủ công: Họ tên/Biệt danh, Điểm xuất phát, Điểm đến, Thời gian đi và Khoảnh khắc di chuyển.
3. Nhấn **"Tạo XanhWrap 🎫"** để hiển thị thẻ XanhWrap đẹp mắt bên phải với các số liệu xanh ước tính.
4. Nhấn **"Sao chép link chia sẻ"** hoặc **"Sao chép caption chia sẻ"** để chia sẻ hành trình xanh lên mạng xã hội kèm các hashtag `#XanhWrap`, `#LuotKhoiChamXanh`, `#EcoTransit`.

### Bước 3.7. Xem Cẩm Nang & Video Feed Placeholder (Commuter Flow)
1. Bấm vào ga số 6 (**Cẩm nang lướt xanh**).
2. Xem các bài viết hướng dẫn di chuyển. Click vào bài viết bất kỳ để mở popup xem chi tiết đầy đủ nội dung.
3. Nhìn sang phần bên phải, xác minh thông tin placeholder video/feed chiến dịch hiển thị thông điệp cam kết sạch đẹp: *"Video/Feed chiến dịch sẽ được cập nhật khi có tư liệu production."*.

---

## 4. Các Hạn Chế Cần Lưu Ý
- **Render Ephemeral Uploads**: Vì Render Free Tier không lưu trữ tệp tin vĩnh viễn, tệp ảnh chụp vé tải lên sẽ bị mất (lỗi 404 ảnh) sau mỗi lần máy chủ API Render khởi động lại hoặc chuyển sang chế độ ngủ.
- **Không có tích hợp Zalo/Facebook thực tế**: Liên kết chia sẻ và caption chia sẻ chỉ hỗ trợ sao chép nhanh qua Clipboard API, không gọi SDK mạng xã hội ngoài thật để bảo vệ sự ổn định.
- **Video Feed Placeholder**: Phần video/feed chiến dịch được mô phỏng dưới dạng thẻ placeholder sạch sẽ để không gọi API bên thứ ba.
