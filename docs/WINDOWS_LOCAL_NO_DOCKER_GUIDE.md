# Hướng Dẫn Khởi Chạy Local Không Cần Docker (Windows) — EcoTransit

Tài liệu này hướng dẫn cách chạy và kiểm thử EcoTransit trên hệ điều hành Windows mà không cần cài đặt Docker Desktop, PostgreSQL cục bộ hay IIS, bằng cách kết nối trực tiếp đến dịch vụ cơ sở dữ liệu điện toán đám mây **Neon PostgreSQL**.

---

## 1. Thiết lập biến môi trường
1. Sao chép file `.env.local.example` thành `.env` tại thư mục gốc dự án.
2. Cấu hình chuỗi kết nối **Neon PostgreSQL** của bạn:
   - `DATABASE_URL`: Đường dẫn liên kết pooled (host có `-pooler`).
   - `DIRECT_URL`: Đường dẫn liên kết direct/unpooled (host KHÔNG có `-pooler`).
3. Đảm bảo tắt Redis cục bộ:
   - `REDIS_ENABLED=false`
4. Cấu hình liên kết URL API Base cục bộ:
   - `NEXT_PUBLIC_API_URL="http://localhost:3001"` (Lưu ý: EcoTransit frontend hỗ trợ cả chế độ URL tuyệt đối và tương đối. Nếu không định nghĩa biến này, hệ thống sẽ sử dụng các đường dẫn tương đối và tự động chuyển tiếp các yêu cầu `/api/*`, `/healthz`, `/readyz` đến Express API thông qua cấu hình proxy của `next.config.mjs`).

---

## 2. Các bước khởi chạy và đồng bộ dữ liệu

Mở PowerShell tại thư mục gốc của dự án và chạy lần lượt các lệnh sau:

### Bước 1: Cài đặt thư viện
```powershell
npm install
```

### Bước 2: Đồng bộ cấu trúc bảng lên Neon CSDL
```powershell
npm run db:push
```
*Lưu ý*: Lệnh này đồng bộ trực tiếp Schema Prisma vào database Neon `neondb` mà không cần chạy file migration cũ.

### Bước 3: Nạp dữ liệu trình diễn và khôi phục trạng thái ban đầu
```powershell
npm run demo:reset
```
*Kết quả*: Hệ thống tự động xóa sạch các bảng cũ, đồng bộ schema và chạy tệp `seed.ts` để nạp 14 ga tàu tuyến Metro Số 1, các cạnh định tuyến kết nối, dữ liệu địa điểm POI mẫu, vé xe mẫu và 3 tài khoản thử nghiệm (Admin, Moderator, User).

### Bước 4: Chạy bộ kiểm thử tự động
```powershell
npm run test
```
*Kết quả*: Bộ test Vitest tích hợp sẽ tự động chạy để kiểm thử tính sẵn sàng và các API đăng nhập/đăng ký thông qua session cookie dựa trên CSDL Neon thật.

### Bước 5: Khởi động hệ thống local
```powershell
npm run dev
```
Hệ thống sẽ chạy song song:
- **Frontend Next.js**: `http://localhost:3000`
- **Backend API**: `http://localhost:3001`

---

## 3. Kiểm tra các cổng Health Check từ PowerShell

Mở một cửa sổ PowerShell mới và chạy các lệnh kiểm tra trạng thái hoạt động:

1. Kiểm tra Liveness:
   ```powershell
   Invoke-WebRequest http://localhost:3001/healthz -UseBasicParsing
   ```
2. Kiểm tra Readiness:
   ```powershell
   Invoke-WebRequest http://localhost:3001/readyz -UseBasicParsing
   ```
   *Kết quả mong đợi*: Cả hai lệnh trả về trạng thái `200 OK` với thông tin chi tiết CSDL kết nối thành công (`database: connected`) và Redis được bỏ qua (`redis: skipped`).
