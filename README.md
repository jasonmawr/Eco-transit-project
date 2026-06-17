# EcoTransit — Lướt Khói Chạm Xanh (TP.HCM)

Nền tảng công nghệ khuyến khích người dân tham gia giao thông xanh (xe buýt, xe buýt điện, tàu metro) tại Thành phố Hồ Chí Minh, giúp lập lộ trình di chuyển tối ưu, tích lũy điểm thưởng từ ảnh chụp vé để đổi voucher quà tặng và chia sẻ hóa đơn bảo vệ môi trường trực quan.

---

## 1. Cấu Trúc Dự Án (Monorepo Workspaces)

Dự án được quản lý dưới dạng NPM Workspaces:
- **`apps/web`**: Ứng dụng Frontend viết bằng Next.js (App Router, Tailwind CSS, Outfit & Inter fonts, Leaflet maps).
- **`apps/api`**: Dịch vụ API Backend viết bằng Express.js (Prisma ORM, Vitest, express-session).
- **`packages/db`**: Cấu hình Prisma và mã nguồn khởi tạo CSDL (seeding).
- **`packages/shared`**: Các khai báo kiểu dữ liệu TypeScript (types) dùng chung giữa Frontend và Backend.

---

## 2. Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

### 2.1. Cấu hình môi trường
Sao chép tệp cấu hình môi trường mẫu:
```bash
cp .env.example .env
```
Thiết lập chuỗi kết nối PostgreSQL thực tế của bạn tại biến `DATABASE_URL` và `DIRECT_URL` trong tệp `.env`.

### 2.2. Khởi tạo cơ sở dữ liệu
```bash
# Cài đặt toàn bộ dependencies
npm install

# Đồng bộ cấu trúc bảng Prisma sang CSDL
npm run db:push

# Nạp dữ liệu mô phỏng demo ban đầu
npm run demo:reset
```

### 2.3. Chạy chế độ phát triển (Development)
Khởi chạy song song cả máy chủ Frontend (cổng 3000) và Backend (cổng 3001) trong chế độ watch-mode:
```bash
npm run dev
```

### 2.4. Chạy kiểm thử tự động (Testing)
Chạy toàn bộ 93 bài kiểm thử tích hợp (integration tests) cho backend:
```bash
npm run test
```

---

## 3. Hướng Dẫn Triển Khai Thực Tế (Deployment Summary)

Hệ thống sẵn sàng để triển khai lên các dịch vụ đám mây miễn phí:
- **Database**: Triển khai trên **Neon PostgreSQL Cloud**.
- **Backend API**: Triển khai trên **Render Web Service** (Node runtime, cổng 10000).
- **Frontend Web**: Triển khai trên **Vercel Hobby** (Next.js framework preset).

Xem chi tiết hướng dẫn deploy và tài liệu đóng băng tại:
- [Danh Sách Kiểm Tra Trình Diễn (docs/FINAL_DEMO_CHECKLIST.md)](file:///f:/HAILEO/My Project/Ecotransit-project/docs/FINAL_DEMO_CHECKLIST.md)
- [Hướng Dẫn Triển Khai Chi Tiết (docs/DEPLOY_DEMO.md)](file:///f:/HAILEO/My Project/Ecotransit-project/docs/DEPLOY_DEMO.md)
- [Kịch Bản Trình Diễn Báo Cáo (docs/DEMO_RUNBOOK.md)](file:///f:/HAILEO/My Project/Ecotransit-project/docs/DEMO_RUNBOOK.md)
- [Danh Sách Hạn Chế Đã Biết (docs/KNOWN_LIMITATIONS.md)](file:///f:/HAILEO/My Project/Ecotransit-project/docs/KNOWN_LIMITATIONS.md)

---

## 4. Các Hạn Chế Bản Demo (Known Limitations)
Xem chi tiết danh sách giới hạn vận hành đóng băng tại [KNOWN_LIMITATIONS.md](file:///f:/HAILEO/My Project/Ecotransit-project/docs/KNOWN_LIMITATIONS.md). Mọi tệp ảnh chụp vé tải lên thư mục `uploads/tickets` sẽ bị xóa sạch khi máy chủ Render Web Service gói miễn phí khởi động lại hoặc redeploy. Dữ liệu chỉ mang tính chất demo mô phỏng truyền thông.
