# Customer USER FLOW Alignment Audit — EcoTransit

Tài liệu đối chiếu và đánh giá mức độ đáp ứng của hệ thống hiện tại đối với tài liệu khách hàng (Mục 21. USER FLOW).

## 1. Danh sách yêu cầu & Trạng thái đánh giá

| Nhóm chức năng | Chi tiết yêu cầu khách hàng | Trạng thái hiện tại | Giải pháp & Kết quả triển khai |
|---|---|---|---|
| **App Shell / Hub** | Homepage kiểu Gamified Hub/App-like, không trải dài toàn bộ module như trang báo, có bản đồ/hành trình/chặng chức năng. | **Full** | Thiết lập **Campaign Journey Hub** mô phỏng tuyến tàu điện 6 chặng kết nối cùng **Premium Scene Deck Viewport** hiển thị duy nhất scene hoạt động với hiệu ứng lật trang 3D cao cấp. |
| **Chọn Nhân Vật** | Cho phép chọn avatar/đại diện trên hành trình (3-5 nhân vật). Lưu trạng thái để duy trì sau khi tải lại trang. | **Full** | Xây dựng panel chọn avatar (5 nhóm nhân vật chiến dịch), lưu trạng thái vào `localStorage` bảo toàn qua SSR/hydration, hiển thị avatar đứng trực quan trên Hub. |
| **Lập Lộ Trình** | Lập lộ trình xanh (Route Planner), tích hợp weather-aware, Dijkstra kết quả chuyển ga. | **Full** | Giữ nguyên chức năng cốt lõi. Đóng gói lại thành khu chức năng tập trung. |
| **Khám Phá Ga** | Xem thông tin ga (Station Experience), POIs xung quanh ga, đánh giá của hành khách xanh. | **Full** | Giữ nguyên chức năng cốt lõi. Đóng gói thành khu chức năng, hiển thị review đã phê duyệt, dùng fallback tên ẩn danh "Hành khách xanh". |
| **Tích Điểm Vé Xanh** | Đăng ảnh vé xanh tích điểm. Đổi tỉ lệ 1 vé = 10 điểm. | **Full** | Khi tải vé lên sẽ ở trạng thái **Chờ kiểm duyệt** và chỉ được cộng **+10 điểm** sau khi Kiểm duyệt viên/Quản trị viên phê duyệt thủ công trong Admin/Moderator Console (hành động duyệt được ghi vết vào nhật ký kiểm toán Audit Log). |
| **Đổi Thưởng** | Đổi điểm sang voucher (mốc 3 vé/30đ, 6 vé/60đ, 9 vé/90đ, 99 vé/990đ). | **Full** | Cập nhật điểm đổi thưởng trong seed dữ liệu và hiển thị số vé quy đổi tương đương trên UI. |
| **XanhWrap** | Hóa đơn chia sẻ từ lộ trình (TimeBill) & Form nhập tay thủ công (Nickname, tuyến đường, thời điểm đi). | **Full** | Phát triển **XanhWrapSection** chứa biểu mẫu nhập tay thủ công, tạo và lưu TimeBill, hiển thị mã chia sẻ, hashtag chiến dịch, cảnh báo chỉ số ước tính. |
| **Cẩm Nang Xanh** | Cẩm nang xanh (Guides), bài viết, mẹo di chuyển & placeholder feed video chiến dịch. | **Full** | Đóng gói Guides và tích hợp khu vực placeholder feed/video sạch đẹp không gọi API ngoài gây lỗi console. |

## 2. Các mục Demo / Placeholder

1. **Facebook/Zalo SDK & Social Provider**: Hiện tại hệ thống không tích hợp SDK mạng xã hội thật. Thay vào đó, sử dụng Web Share API và sao chép văn bản (caption/link) kèm hashtag chiến dịch (#XanhWrap #LuotKhoiChamXanh #EcoTransit) làm giải pháp chia sẻ.
2. **Video & Feed Chiến dịch**: Phần cẩm nang hiển thị thông điệp cam kết: *"Video/Feed chiến dịch sẽ được cập nhật khi có tư liệu production."* mà không gọi SDK ngoài để bảo vệ console sạch.
3. **Ảnh Nhân vật/Avatar**: Sử dụng hệ thống biểu tượng SVG / Emoji đặc trưng mô tả từng nhân vật chiến dịch để đảm bảo tính mỹ thuật, không vi phạm bản quyền hình ảnh.
4. **Trích xuất thông tin ảnh vé (Mock OCR)**: Không sử dụng các dịch vụ OCR thương mại thực tế, hệ thống phân tích tệp ảnh và tự động tạo văn bản nhận diện demo.
5. **Cổng thanh toán (No Real Payment)**: Dữ liệu giá vé và số dư chỉ mang tính chất demo mô phỏng truyền thông.
6. **Lưu trữ đám mây (Ephemeral Storage)**: Bản demo lưu trữ các ảnh vé xe tải lên cục bộ tại thư mục `uploads/tickets` trên Render và chấp nhận bị xóa sạch khi máy chủ Render restart.

