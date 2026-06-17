# Danh Sách Hạn Chế Đã Biết (Known Limitations) — EcoTransit

Tài liệu này đóng băng và liệt kê các giới hạn kỹ thuật của hệ thống **EcoTransit / Lướt Khói Chạm Xanh** trong phiên bản trình diễn (Demo Freeze). Các giới hạn này là chủ ý thiết kế nhằm duy trì mô hình vận hành gọn nhẹ, bảo mật và miễn phí (Free-First Foundation).

---

## 1. Phương Pháp Xác Thực Phát Triển (NO-BROWSER Verification)
- Trong suốt quá trình phát triển và kiểm thử, toàn bộ việc tích hợp hệ thống được xác thực bằng mã nguồn tĩnh (Static Audit), các bộ test tích hợp tự động (`npm run test`), và các lệnh gọi kiểm tra API thông qua PowerShell (`Invoke-WebRequest`).
- Dự án không tích hợp các bộ công cụ tự động hóa trình duyệt như Playwright, Cypress, Puppeteer, hay Selenium, nhằm đảm bảo tốc độ build nhanh và tránh xung đột môi trường cục bộ.
- Mọi kiểm thử giao diện trực quan cần được thực hiện thủ công bởi kiểm thử viên hoặc người vận hành theo bộ tài liệu hướng dẫn.

## 2. Giới Hạn Môi Trường Lưu Trữ Tạm Thời (Render Ephemeral Storage)
- Ứng dụng Backend API được lưu trữ trên Render Web Service (gói miễn phí).
- **Đĩa lưu trữ tạm thời**: Môi trường này sử dụng ephemeral storage cho thư mục ảnh tải lên `uploads/tickets/`.
- **Hệ quả**: Mọi hình ảnh vé tàu xe đã tải lên sẽ bị xóa sạch khỏi ổ đĩa vật lý mỗi khi Render khởi động lại máy chủ (do không hoạt động trong 15 phút), khi cập nhật cấu hình, hoặc khi deploy phiên bản mới.
- **Tính toàn vẹn của dữ liệu**: Các bản ghi cơ sở dữ liệu (Database Records) trên Neon PostgreSQL và dữ liệu trích xuất OCR vẫn được giữ nguyên vẹn. Chỉ có tệp ảnh vật lý bị mất, dẫn đến phản hồi lỗi 404 khi người dùng truy cập xem chi tiết ảnh vé (thumbnail) sau khi hệ thống restart.

## 3. Khởi Động Nguội Trên Render Free Tier (Render Cold Start)
- API chạy trên gói Free của Render. Máy chủ sẽ tự động tạm dừng (sleep) nếu không nhận được yêu cầu nào trong 15 phút liên tục.
- Khi có lượt truy cập mới, máy chủ cần thời gian "khởi động nguội" khoảng **50 đến 90 giây** để thiết lập lại vùng chứa (container) và kết nối với cơ sở dữ liệu.
- Trong thời gian này, Frontend của ứng dụng trên Vercel sẽ hiển thị banner **"Đang Kết Nối Máy Chủ - Waking Up"** để thông báo cho người dùng kiên nhẫn chờ đợi.

## 4. Không Tích Hợp Các Nhà Cung Cấp Ngoài Thực Tế (No External Providers)
Để đảm bảo tính độc lập và chi phí bằng 0:
- **Xác thực mạng xã hội (No Real Social Provider)**: Hệ thống sử dụng cơ chế xác thực email/mật khẩu tự xây dựng kết hợp Express Session lưu trữ trên Database (Prisma Session Store). Không tích hợp đăng nhập qua Facebook, Google Auth, hay Zalo thực tế.
- **Cổng thanh toán (No Real Payment)**: Không có liên kết đến các cổng thanh toán (MoMo, ZaloPay, VNPay, Stripe) để mua vé hay nạp tiền. Dữ liệu giá vé và số dư chỉ mang tính chất demo mô phỏng.
- **Trích xuất thông tin ảnh vé (No Real OCR Provider)**: Không sử dụng các dịch vụ OCR thương mại (như Google Cloud Vision, AWS Textract). Hệ thống mô phỏng nhận diện (Mock OCR) bằng cách phân tích kích thước tệp, loại tệp, loại phương tiện được chọn, và tự động tạo văn bản nhận diện demo với độ chính xác ngẫu nhiên được ghi nhận trong cơ sở dữ liệu.
- **Lưu trữ đám mây (No Object Storage)**: Không tích hợp các kho lưu trữ như AWS S3, Cloudinary hay Google Cloud Storage. Ảnh được ghi trực tiếp vào hệ thống tệp cục bộ trên máy chủ (và chấp nhận bị xóa khi Render reset).

## 5. Dữ Liệu Ước Tính Mô Phỏng (Storytelling Estimates Only)
- Các chỉ số hiển thị trên hóa đơn thời gian (Time Bill) bao gồm điểm xanh (Green Score), lượng khí thải CO₂ giảm thiểu ước tính (g), và chi phí tiết kiệm ước tính (VND) được tính toán bằng các công thức toán học nội bộ dựa trên độ dài quãng đường di chuyển giả định.
- Đây là dữ liệu dùng cho mục đích truyền thông, giáo dục ý thức bảo vệ môi trường và kể chuyện (storytelling) trong khuôn khổ chiến dịch, không phải là kết quả đo lường khoa học hoặc thực tế chính xác tuyệt đối.

## 6. Sẵn Sàng Triển Khai (Deployment Readiness Accepted)
- Toàn bộ codebase monorepo của EcoTransit đã vượt qua tất cả các điều kiện ràng buộc build tĩnh (`npm run build`), kiểm thử tự động (`npm run test` 93/93 tests pass), và liveness/readiness check cục bộ.
- Dự án đang ở trạng thái **Sẵn sàng triển khai thực tế (Ready for Live Deploy)**. Việc đưa dự án lên chạy thật (Live Deployment) trên Vercel/Render/Neon sẽ được hoàn tất ngay khi người vận hành thực hiện cấu hình các tài khoản dịch vụ và biến môi trường tương ứng.
