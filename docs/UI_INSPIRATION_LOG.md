# UI Motion Inspiration & Brand Alignment Log — Lướt Khói Chạm Xanh

Tài liệu này ghi nhận các phân tích thiết kế, định hướng hoạt họa và phân tích hiệu năng phục vụ cho chiến dịch truyền thông **"Lướt Khói Chạm Xanh"** dựa trên kho cảm hứng từ 21st.dev.

---

## 1. Cấu trúc Primitives & Shadcn tương thích

Hệ thống thư mục được thiết lập chuẩn hóa trong monorepo:
* Thư mục chứa các thành phần nguyên bản (primitives): [apps/web/components/ui/](../apps/web/components/ui/)
* Alias import nội bộ Next.js: `@/components/ui/...` cấu hình thông qua `tsconfig.json`.

---

## 2. Chi Tiết Các Component Hoạt Họa Tích Hợp

### 2.1 NavHeader (Thanh điều hướng hoạt họa)
* **Ý tưởng**: Lấy cảm hứng từ hiệu ứng `nav-header.tsx` của 21st.dev. Sử dụng con trỏ trượt thông minh (layoutId pill) bằng Framer Motion. Khi rê chuột qua các mục lục, một khối nền kính bo góc sẽ trượt mượt mà bám theo.
* **Căn chỉnh Brand**:
  * Sử dụng màu nền Vibrant Green `#9FCE1A` có độ tương phản cao với chữ màu tối Urban Beige để bảo toàn khả năng đọc (Readability).
  * Menu phản ánh đúng chiến dịch: Lập lộ trình, Tuyến ga & Bản đồ, Đổi thưởng (Sắp ra mắt), Cộng đồng (Sắp ra mắt).
* **Hiệu năng & Khả năng tiếp cận (A11y)**:
  * Hoàn toàn tương thích phím Tab chuyển hướng focus và hiển thị focus-ring rõ ràng.
  * Tự động ẩn bớt liên kết phụ hoặc thu gọn trên Viewport Mobile 390px để tránh tràn.

### 2.2 FluidDropdown (Hộp chọn hoạt họa lỏng)
* **Ý tưởng**: Lấy cảm hứng từ `fluid-dropdown.tsx` để thay thế cho thẻ `<select>` thô cứng. Dropdown hiển thị với hiệu ứng giãn nở mượt mà (AnimatePresence) và tích hợp các icon chỉ dẫn trực quan từ `lucide-react`.
* **Căn chỉnh Brand**:
  * Thiết kế panel màu Trắng `#FFFFFF` trên nền Urban Beige `#FFF3DD` để tạo chiều sâu.
  * Đường viền mỏng bo góc 2xl sang trọng. Hoạt họa icon đám mây/mưa/nắng nắng sống động.
* **Hiệu năng & Khả năng tiếp cận (A11y)**:
  * Tích hợp sự kiện lắng nghe đóng mở bằng phím **Escape** và đóng khi bấm ra ngoài **Click Outside**.
  * Hỗ trợ đầy đủ các thuộc tính trợ năng `aria-haspopup` và `aria-expanded` của W3C.

### 2.3 MotionFlowBackground (Nền hoạt họa dòng chảy & Lá rụng)
* **Ý tưởng**: Tạo ra một nền sống động cho Hero Section thay thế các dải màu gradient tĩnh đơn điệu. Sử dụng các thẻ vector SVG nhẹ nhàng vẽ đường chảy của khí động học đại diện cho "Lướt Khói", đi kèm hiệu ứng lá cây nhỏ bay nhè nhẹ (Leaf Accents) đại diện cho "Chạm Xanh".
* **Căn chỉnh Brand**:
  * Tạo cảm giác thư thái, hands-free, stress-less.
  * Sử dụng các chấm tròn trượt theo đường dẫn mô phỏng mạng lưới xe buýt xanh và metro.
* **Hiệu năng & Khả năng tiếp cận (A11y)**:
  * Chỉ sử dụng CSS và các thẻ SVG nhẹ, tuyệt đối không tải WebGL hay Three.js làm tốn tài nguyên GPU di động.
  * Tôn trọng cài đặt hệ thống: Dừng toàn bộ chuyển động lá bay và di chuyển nếu người dùng bật chế độ giảm chuyển động (`prefers-reduced-motion: reduce`).

### 2.4 PremiumCTA (Nút magnetic viền chạy phát sáng)
* **Ý tưởng**: Lấy cảm hứng từ nút bấm Moving Border từ 21st.dev. Tạo một đường viền chạy phát sáng Electric Blue bao quanh nút và tạo cảm giác nảy lò xo khi hover.
* **Căn chỉnh Brand**:
  * Phục vụ nút hành động chính "Tìm kiếm lộ trình xanh" và "Tìm lộ trình ngay" để kích thích thao tác.
  * Màu Electric Blue `#0066FF` thể hiện yếu tố công nghệ đô thị thông minh.
* **Hiệu năng & Khả năng tiếp cận (A11y)**:
  * Sử dụng hiệu ứng chuyển dịch góc xoay gradient thông qua CSS Variables để tối ưu hóa CPU.
  * Khai báo sự kiện bấm Enter/Space thuận tiện để kích hoạt.
