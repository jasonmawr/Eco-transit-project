# 🌿 HỒ SƠ TỔNG THỂ THIẾT KẾ UX/UI, USER FLOW & WIREFRAME
# CHIẾN DỊCH "LƯỚT KHÓI CHẠM XANH"

> **Dự án**: Nền Tảng Di Chuyển Xanh & Tích Lũy Điểm Thưởng TP. Hồ Chí Minh  
> **Thương hiệu duy nhất**: **LƯỚT KHÓI CHẠM XANH**  
> **Phiên bản**: 2.0 (Enterprise Specification Dossier)  
> **Bộ hồ sơ bao gồm 3 tập tài liệu chuyên biệt chuẩn quốc tế (Modular Design Suite)**.

---

## 📚 MỤC LỤC BỘ HỒ SƠ THIẾT KẾ ĐẦY ĐỦ

Bộ hồ sơ thiết kế chuẩn quốc tế của dự án được chia thành 3 chuyên đề độc lập, chi tiết và trực quan:

| Tập Tài Liệu | Nội Dung Chuyên Môn | Liên Kết Chi Tiết |
| :--- | :--- | :--- |
| **TẬP 1** | **Hệ Thống User Flows, State Diagrams & User Journey Maps**<br>• Sơ đồ luồng toàn cảnh hệ sinh thái<br>• Bản đồ hành trình trải nghiệm người dùng (Gen Z, Văn phòng, Du khách)<br>• Sơ đồ tuần tự Lập lộ trình Dijkstra & Giá vé gộp chuẩn TP.HCM<br>• Sơ đồ trạng thái vé OCR (Ticket Lifecycle)<br>• Sơ đồ đổi voucher chống trùng lặp (Idempotency Key) | 📄 [**`01_USER_FLOWS_AND_JOURNEY_MAPS.md`**](./01_USER_FLOWS_AND_JOURNEY_MAPS.md) |
| **TẬP 2** | **Bản Vẽ Wireframe & Kiến Trúc Bố Cục Giao Diện (Hi-Fi Wireframes)**<br>• Cây phân cấp màn hình & thanh điều hướng trung tâm<br>• Hệ thống lưới Layout Grid (Mobile 390px, Tablet 768px, Desktop 1280px+)<br>• Bản vẽ Wireframe chi tiết 7 màn hình ứng dụng<br>• Kiến trúc Modal 2 cột qua React Portal gắn trực tiếp vào `document.body` | 📄 [**`02_WIREFRAMES_AND_LAYOUT_ARCHITECTURE.md`**](./02_WIREFRAMES_AND_LAYOUT_ARCHITECTURE.md) |
| **TẬP 3** | **Hệ Thống Thiết Kế Design System & Quy Chuẩn UI Prototype**<br>• Bảng mã màu Tokens chuẩn WCAG 2.1 AA<br>• Thang tỷ lệ kiểu chữ (`Outfit` + `Inter`)<br>• Vi tương tác chuyển động & Motion Physics (Framer Motion)<br>• Ma trận trạng thái nút bấm & thành phần UI<br>• Quy chuẩn SEO Google Search Indexing & Luồng CI/CD Vercel/Render | 📄 [**`03_DESIGN_SYSTEM_AND_UI_SPECIFICATIONS.md`**](./03_DESIGN_SYSTEM_AND_UI_SPECIFICATIONS.md) |

---

## 🌟 TÓM TẮT ĐIỂM NHẤN CÔNG NGHỆ & THIẾT KẾ

1. **Chuẩn hóa nhận diện duy nhất**: Bỏ hoàn toàn tiền tố thừa, tập trung 100% thương hiệu **"LƯỚT KHÓI CHẠM XANH"**.
2. **Khám phá 21 ga Metro Tuyến 1 & Gamification**:
   * 6 địa điểm mở khóa toàn bộ bài viết hướng dẫn chi tiết.
   * 15 địa điểm cấp độ tiếp theo hiển thị huy hiệu tím `🔒 SẮP MỞ KHÓA (CẤP SAU)`.
   * Cửa sổ xem chi tiết 2 cột (Ảnh/Liên hệ bên trái + Bài viết/Lộ trình bên phải) vận hành qua React Portal, không bao giờ bị cắt xén.
3. **Thuật toán Lộ trình Xanh**: Gộp chặng liên tục và tính đúng biểu giá Metro Tuyến 1 (7k/12k/16k/20k) và xe buýt (7k).
4. **Sẵn sàng Chỉ mục Tìm kiếm Google (Google Search Indexing)**: Tích hợp đầy đủ `sitemap.xml`, `robots.txt` và Schema JSON-LD `@type: WebApplication`.

---
*Tài liệu được biên soạn và bảo chứng bởi Đội ngũ Senior Fullstack Engineers & Lead UI/UX Architects.*
