# 🗺️ 01. HỆ THỐNG USER FLOWS, STATE DIAGRAMS & USER JOURNEY MAPS
# CHIẾN DỊCH "LƯỚT KHÓI CHẠM XANH"

> **Dự án**: Nền Tảng Di Chuyển Xanh & Tích Lũy Điểm Thưởng TP. Hồ Chí Minh  
> **Thương hiệu**: **LƯỚT KHÓI CHẠM XANH**  
> **Tiêu chuẩn tài liệu**: Chuẩn phân tích luồng hệ thống quốc tế (UML / ISO 5807 / Agile Journey Mapping).

---

## 1. TỔNG QUAN HỆ THỐNG LUỒNG TƯƠNG TÁC (ECOSYSTEM FLOWCHART)

### 🖼️ Biểu Đồ UML Use Case Trực Quan (Vẽ bằng Diagrams.net / Draw.io):
![Sơ Đồ UML Use Case](./diagrams/01_use_case_diagram.svg)
*(Tệp nguồn chỉnh sửa kéo thả trực tiếp trên `https://app.diagrams.net`: [`01_use_case_diagram.drawio`](./diagrams/01_use_case_diagram.drawio))*

Sơ đồ tổng quan toàn bộ kiến trúc tương tác đa chức năng trên nền tảng **Lướt Khói Chạm Xanh**:

```mermaid
flowchart TD
    Start([🌐 Khách truy cập Landing Page]) --> DecisionAuth{Đã có tài khoản?}
    
    DecisionAuth -->|Chưa đăng nhập| GuestFlow[Trải nghiệm Khách: Tra cứu Lộ trình / Xem Ga Metro / Chơi XanhWrap]
    DecisionAuth -->|Đã đăng nhập| UserDashboard[Bảng điều khiển Thành viên Lướt Khói Chạm Xanh]
    
    GuestFlow --> PromptAuth[Yêu cầu Đăng nhập khi: Quét vé tích điểm / Đổi voucher quà tặng]
    PromptAuth --> AuthModal[Modal Xác thực / Đăng ký Email nhanh]
    AuthModal --> UserDashboard
    
    UserDashboard --> Module1[📍 1. Lập Lộ Trình Xanh & Tạo Hóa Đơn]
    UserDashboard --> Module2[🏛️ 2. Khám Phá 21 Ga & Cẩm Nang Cấp Độ]
    UserDashboard --> Module3[🎫 3. Quét Vé OCR & Tích Lũy Điểm Xanh]
    UserDashboard --> Module4[🎁 4. Sàn Đổi Voucher Xanh SM & Đối Tác]
    UserDashboard --> Module5[✨ 5. Minigame XanhWrap & Quay Số May Mắn]
    UserDashboard --> Module6[👤 6. Tùy biến Avatar Nhân Vật Di Chuyển]
    
    AdminAuth{Tài khoản Admin / Mod?}
    UserDashboard -->|Nếu có quyền Admin| AdminAuth
    AdminAuth -->|Hợp lệ| AdminConsole[🛡️ Bảng Điều Khiển Quản Trị Hệ Thống]
    
    style Start fill:#10B981,stroke:#047857,stroke-width:2px,color:#fff
    style UserDashboard fill:#0F3E31,stroke:#059669,stroke-width:2px,color:#fff
    style AdminConsole fill:#7C3AED,stroke:#5B21B6,stroke-width:2px,color:#fff
    style Module1 fill:#E6F7F0,stroke:#10B981,stroke-width:1px,color:#0F3E31
    style Module2 fill:#E6F7F0,stroke:#10B981,stroke-width:1px,color:#0F3E31
    style Module3 fill:#E6F7F0,stroke:#10B981,stroke-width:1px,color:#0F3E31
    style Module4 fill:#E6F7F0,stroke:#10B981,stroke-width:1px,color:#0F3E31
    style Module5 fill:#E6F7F0,stroke:#10B981,stroke-width:1px,color:#0F3E31
    style Module6 fill:#E6F7F0,stroke:#10B981,stroke-width:1px,color:#0F3E31
```

---

## 2. BẢN ĐỒ HÀNH TRÌNH TRẢI NGHIỆM NGƯỜI DÙNG (USER JOURNEY MAPS)

### 2.1. Hành trình Gen Z / Sinh viên: Minh Anh (20 tuổi) – Săn Vé & Đổi Voucher

```mermaid
journey
    title Hành trình Sinh viên khám phá Metro Số 1 & Đổi Voucher Xanh SM
    section Tiếp cận & Tìm đường
      Mở web Lướt Khói Chạm Xanh trên điện thoại: 5: Sinh viên
      Nhập điểm xuất phát KTX ĐHQG đến Ga Bến Thành: 5: Sinh viên
      Xem lộ trình tối ưu kết hợp Tuyến Bus 19 & Metro 1: 5: Hệ thống
      Nhận gợi ý tránh mưa và biểu giá chuẩn 12.000 VNĐ: 5: Hệ thống
    section Trải nghiệm thực tế
      Đi Metro Số 1 ngắm cảnh qua cầu Sài Gòn: 5: Sinh viên
      Chụp ảnh check-in & lưu lại vé Metro: 4: Sinh viên
    section Tích điểm & Đổi thưởng
      Tải ảnh vé lên hệ thống Lướt Khói Chạm Xanh: 5: Sinh viên
      Hệ thống quét OCR xác thực hợp lệ +10 Điểm Xanh: 5: Hệ thống
      Tích đủ 50 điểm đổi ngay Voucher Xanh SM 30.000đ: 5: Sinh viên
      Nhận mã ưu đãi tức thì & lưu vào ví cá nhân: 5: Hệ thống
    section Lan tỏa & Minigame
      Tạo thẻ tổng kết XanhWrap danh hiệu 'Thần Xe Bus Điện': 5: Sinh viên
      Chia sẻ lên story Facebook kèm hashtag #LuotKhoiChamXanh: 5: Sinh viên
```

---

## 3. SƠ ĐỒ LUỒNG CHI TIẾT TỪNG TÍNH NĂNG (DETAILED FEATURE FLOWS)

### 3.1. Luồng Lập lộ trình đa phương thức (Multi-modal Routing Sequence)

#### 🖼️ Lưu Đồ Thuật Toán Dijkstra & Tính Giá Vé Gộp (Vẽ bằng Diagrams.net / Draw.io):
![Lưu Đồ Dijkstra Lộ Trình & Giá Vé](./diagrams/03_dijkstra_multimodal_routing_flow.svg)
*(Tệp nguồn chỉnh sửa kéo thả trực tiếp trên `https://app.diagrams.net`: [`03_dijkstra_multimodal_routing_flow.drawio`](./diagrams/03_dijkstra_multimodal_routing_flow.drawio))*

```mermaid
sequenceDiagram
    autonumber
    actor Commuter as Người đi lại
    participant Client as Web App (Next.js Client)
    participant API as Route Engine API (Express)
    participant Dijkstra as Thuật toán Dijkstra Đồ Thị
    participant Tariff as Bộ Tính Giá Vé Chuẩn TP.HCM
    participant DB as PostgreSQL (Prisma ORM)

    Commuter->>Client: Nhập Điểm Đi (Origin) & Điểm Đến (Destination)
    Commuter->>Client: Chọn ưu tiên: 'Nhanh nhất' / 'Ít đổi tuyến' / 'Tiết kiệm'
    Client->>API: GET /api/routes/plan?from=...&to=...&preference=...
    
    critical Xác thực & Nạp dữ liệu
        API->>DB: Lấy danh sách Trạm (Stations) & Cạnh kết nối (RouteEdges)
        DB-->>API: 14 Ga Metro + Tuyến Bus kết nối
    end

    API->>Dijkstra: Khởi tạo Adjacency List & Tính trọng số (Thời gian + Thời tiết)
    Dijkstra->>Dijkstra: Tìm Top 3 đường đi ngắn nhất
    
    API->>Tariff: consolidateLegs() & calculateMetroFare()
    Note over Tariff: ≤5km: 7k | 5-10km: 12k | 10-15km: 16k | >15km: 20k | Bus: 7k cố định
    Tariff-->>API: Giá vé gộp chuẩn xác (Không bị nhân đôi ga lẻ)

    API-->>Client: 3 Phương án lộ trình hoàn chỉnh kèm lượng CO₂ giảm
    Client->>Commuter: Hiển thị Thẻ Lộ Trình & Khung Bản Đồ Tương Tác
```

---

### 3.2. Luồng Khám phá 21 ga & Cơ chế Mở khóa Cấp độ (Station Discovery & Gamification)

```mermaid
flowchart TD
    A[Người dùng truy cập mục Khám phá ga] --> B[Hiển thị danh sách 14 Ga Metro Số 1]
    B --> C[Chọn một Ga ví dụ: Ga Bến Thành, Ba Son, Tân Cảng...]
    C --> D[Lọc theo danh mục: 🍜 Ăn uống | ☕ Cafe | 🏛️ Di tích | 🛍️ Mua sắm]
    
    D --> E[Hiển thị Lưới 21 Địa Điểm Thực Tế]
    
    E --> PlaceCheck{Trạng thái Địa điểm}
    
    PlaceCheck -->|⭐ 6 Địa điểm Đã Mở Khóa| FullArticle[Mở Modal 2 Cột Đầy Đủ Chi Tiết]
    FullArticle --> FA1[Cột Trái: Ảnh sắc nét + Địa chỉ + Giờ mở + Giá vé + Ga gần nhất]
    FullArticle --> FA2[Cột Phải: Bài viết hướng dẫn chi tiết + Điểm nổi bật + Cách đi Metro/Bus]
    
    PlaceCheck -->|🔒 15 Địa điểm Cấp Tiếp Theo| LockedModal[Mở Modal Khóa Cấp Độ Gamification]
    LockedModal --> LM1[Badge Tím: 🔒 SẮP MỞ KHÓA - CẤP TIẾP THEO]
    LockedModal --> LM2[Thông điệp: Tích cực tích lũy vé xe xanh để mở sớm]
    LockedModal --> LM3[Vẫn cung cấp: Địa chỉ chính xác, khoảng cách đi bộ và ga gần nhất]

    style FullArticle fill:#E6F7F0,stroke:#10B981,stroke-width:2px,color:#0F3E31
    style LockedModal fill:#FAF5FF,stroke:#7C3AED,stroke-width:2px,color:#5B21B6
```

---

### 3.3. Sơ đồ Chuyển trạng thái Vé Xanh (Ticket State Transition Diagram)

```mermaid
stateDiagram-v2
    [*] --> Uploaded: Người dùng tải ảnh chụp vé lên
    
    state Uploaded {
        [*] --> OCRProcessing: Khởi chạy nhận diện ký tự quang học
        OCRProcessing --> PreVerified: Đọc được số vé, ngày đi & tuyến
        OCRProcessing --> ManualReviewRequired: Ảnh mờ / góc chụp nghiêng
    }
    
    PreVerified --> PendingModeration: Tạo bản ghi Ticket (Status: 'pending')
    ManualReviewRequired --> PendingModeration: Đưa vào hàng đợi Admin
    
    state PendingModeration {
        [*] --> InReviewQueue: Hiển thị trên Admin Console
    }
    
    PendingModeration --> Verified: Admin phê duyệt / AI tự động đối soát hợp lệ
    PendingModeration --> Rejected: Ảnh trùng lặp / Không phải vé giao thông xanh
    
    state Verified {
        [*] --> CreditPoints: +10 Điểm Xanh vào PointsLedger
        CreditPoints --> UpdatePassbook: Cập nhật thẻ VIP & Thẻ vé số hóa
    }
    
    state Rejected {
        [*] --> NotifyUser: Gửi thông báo kèm lý do từ chối
    }
    
    Verified --> [*]
    Rejected --> [*]
```

---

### 3.4. Sơ đồ Vòng đời Voucher & Cơ chế Đổi quà An toàn (Voucher Lifecycle & Idempotency)

```mermaid
stateDiagram-v2
    [*] --> ActiveStock: Admin cấu hình Voucher (Số lượng, Hạn dùng, Điểm đổi)
    
    state ActiveStock {
        [*] --> DisplayCatalog: Hiển thị trên Sàn Đổi Thưởng Lướt Khói Chạm Xanh
    }
    
    ActiveStock --> Redeeming: Người dùng nhấn "Đổi ngay"
    
    state Redeeming {
        [*] --> CheckBalance: Kiểm tra số dư PointsLedger ≥ PointsCost
        CheckBalance --> CheckStock: Kiểm tra stockRemaining > 0
        CheckStock --> LockTransaction: Khởi tạo khóa Idempotency Key duy nhất
    }
    
    Redeeming --> RedeemedSuccess: Trừ điểm ví + Giảm stockRemaining + Gán mã bí mật
    Redeeming --> Failed: Không đủ điểm hoặc hết hàng trong kho
    
    state RedeemedSuccess {
        [*] --> GenerateBarcode: Sinh mã QR Code / Barcode xuất trình tại quầy
        GenerateBarcode --> StoredInWallet: Lưu vào tab 'Voucher Của Tôi'
    }
    
    ActiveStock --> OutOfStock: stockRemaining = 0
    ActiveStock --> Expired: currentDate > validUntil
    
    OutOfStock --> ActiveStock: Admin nạp thêm mã kho
    RedeemedSuccess --> Used: Người dùng sử dụng voucher tại đối tác (Xanh SM, Highlands...)
    
    Used --> [*]
    Expired --> [*]
```

---

### 3.5. Luồng Quản trị & Vận hành Chiến dịch (Admin Operations Flow)

```mermaid
flowchart LR
    subgraph AdminAuthContext [Xác thực & Phân quyền]
        A[Đăng nhập Quản trị viên] --> B{Kiểm tra JWT & Role}
        B -->|Role: ADMIN / MODERATOR| C[Bảng Điều Khiển Admin Console]
        B -->|Role: USER / Khách| D[Từ chối truy cập 403 Forbidden]
    end

    subgraph MetricsOversight [Giám sát Chỉ số Thời gian thực]
        C --> M1[🌐 937 Lượt Truy Cập Landing Page]
        C --> M2[✨ 132 Lượt Tạo Minigame XanhWrap]
        C --> M3[🚗 45 Voucher Xanh SM Đã Đổi]
        C --> M4[🎫 48 Vé Tải Lên / 45 Vé Hợp Lệ]
    end

    subgraph OperationActions [Tác vụ Vận hành]
        C --> OP1[Kiểm duyệt vé: Duyệt / Hủy]
        C --> OP2[Quản lý Kho Voucher: Bật / Tắt / Thêm số lượng]
        C --> OP3[Quản lý Cẩm nang & Địa điểm Ga]
        C --> OP4[Kiểm toán Bảo mật: Audit Logs]
    end
```

---
*Tài liệu thuộc Bộ hồ sơ Tiêu chuẩn Thiết kế Hệ thống Lướt Khói Chạm Xanh.*
