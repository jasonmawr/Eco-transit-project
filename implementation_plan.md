# Implementation Plan — Batch 01D: Brand Identity Alignment & Premium Motion Gate

Căn chỉnh toàn bộ giao diện theo bộ nhận diện **Lướt Khói Chạm Xanh Visual Identity Guidelines**, đồng thời chọn lọc và tích hợp các hiệu ứng UI chuyển động cao cấp lấy cảm hứng từ 21st.dev.

## User Review Required

> [!IMPORTANT]
> - **Brand Identity**: Logo và tiêu đề chính thức chuyển thành **Lướt Khói Chạm Xanh**. Thương hiệu `EcoTransit` được chuyển thành platform/sub-brand nhỏ ở góc giao diện.
> - **Bảng màu mới**: Xóa màu lục bảo/cyan cũ, thay thế triệt độ bằng bộ 4 màu chủ đạo:
>   - Electric Blue: `#0066FF` (Màu chính cho liên kết, nút bấm và tuyến Metro)
>   - Vibrant Green: `#9FCE1A` (Màu nhấn mạnh, tuyến Bus, điểm xanh)
>   - White: `#FFFFFF` (Nền thẻ panel)
>   - Urban Beige: `#FFF3DD` (Nền trang chủ, tạo chiều sâu ấm áp)
> - **Cấu trúc Thư mục**: Thiết lập cấu hình thư mục `apps/web/components/ui/` để chứa các UI Primitives hoạt họa dùng chung độc lập khỏi Feature Components.
> - **Dependencies**: Cài đặt thêm `framer-motion` và `lucide-react` phục vụ cho chuyển động nảy, trượt mượt mà.

## Open Questions

None. The brand visual parameters are fully detailed and approved for direct implementation.

---

## Implemented Changes

### 1. Design System & Configuration

#### [MODIFY] [apps/web/tailwind.config.js](apps/web/tailwind.config.js)
- Cấu hình lại mã màu `eco` trong bảng theme:
  - `primary`: `#0066FF` (Electric Blue)
  - `primaryDeep`: `#004ecc` (Deep Electric Blue)
  - `accentGreen`: `#9FCE1A` (Vibrant Green)
  - `accentGreenDeep`: `#82a815` (Deep Vibrant Green)
  - `bgBeige`: `#FFF3DD` (Urban Beige)
  - `ink`: `#0A1118` (Dark Charcoal)
  - `muted`: `#4B5E70` (Muted Blue-Grey)

#### [MODIFY] [apps/web/app/globals.css](apps/web/app/globals.css)
- Thiết lập biến môi trường màu sắc theo theme mới.
- Định nghĩa hiển thị Font Display: Cấu hình phong cách hiển thị chữ giống thiết kế `SG85-CHi SON 1` thông qua kiểu `font-display` (ultra-bold, geometric, futuristic square-grooves, custom letter-spacing) để dễ dàng hoán đổi khi có tệp font local thật.
- Bổ sung lớp phủ cấu trúc hạt bụi mịn **Grain Texture** (~10% opacity) và đường sóng chuyển động mềm mại **Motion Flow** để tạo chất liệu thị giác cao cấp.
- Áp dụng các keyframe mượt mà, hỗ trợ giảm chuyển động (`prefers-reduced-motion`).

---

### 2. Premium UI Primitives (`apps/web/components/ui`)

#### [NEW] [apps/web/components/ui/nav-header.tsx](apps/web/components/ui/nav-header.tsx)
- Thanh menu hoạt họa. Sử dụng `framer-motion` để tạo con trỏ pill (hover cursor pill) di chuyển mượt mà theo vị trí rê chuột của người dùng, đổi màu chữ tương ứng với độ tương phản cao.

#### [NEW] [apps/web/components/ui/fluid-dropdown.tsx](apps/web/components/ui/fluid-dropdown.tsx)
- Hộp chọn hoạt họa lỏng (fluid dropdown) hỗ trợ `AnimatePresence`, đóng mở mượt mà bằng phím Escape hoặc click-outside. Sử dụng icon từ `lucide-react`. Áp dụng trực tiếp làm bộ chọn điều kiện thời tiết (Weather Preset Selector) thay thế cho chip chọn tĩnh cũ.

#### [NEW] [apps/web/components/ui/motion-flow-background.tsx](apps/web/components/ui/motion-flow-background.tsx)
- Component tạo nền hoạt họa chuyển động dạng sóng nhẹ nhàng, đi kèm các điểm nhấn lá xanh rụng bay nhè nhẹ (Leaf Accents) và phủ lớp Grain Texture mịn màng cho phần Hero.

#### [NEW] [apps/web/components/ui/premium-cta.tsx](apps/web/components/ui/premium-cta.tsx)
- Nút bấm hoạt họa viền phát sáng chạy vòng quanh (moving border style), có hiệu ứng nảy từ tính (magnetic-inspired spring scale) dành riêng cho nút "Tìm kiếm lộ trình xanh" và "Tìm lộ trình ngay".

---

### 3. Redesign Components (`apps/web/components`)

#### [MODIFY] [apps/web/components/EcoTransitHeader.tsx](apps/web/components/EcoTransitHeader.tsx)
- Đổi tên tiêu đề hiển thị và logo phụ sang nhận diện **Lướt Khói Chạm Xanh**.
- Tích hợp primitive `NavHeader` cho menu điều hướng.
- Gắn thẻ "Sắp ra mắt" và thông báo trực quan rõ ràng cho các CTA chưa khả dụng.

#### [MODIFY] [apps/web/components/HeroSection.tsx](apps/web/components/HeroSection.tsx)
- Tái thiết kế Hero Section để truyền tải câu chuyện chiến dịch: *"Lướt khỏi khói xe, chạm vào nhịp xanh"* theo tinh thần di chuyển đô thị hiện đại "hands-free, stress-less, smart-spending".
- Bổ sung `MotionFlowBackground` làm nền phía dưới.
- Vẽ lại sơ đồ hoạt họa Metro/Bus và các thẻ chỉ số thật bằng Electric Blue và Vibrant Green.

#### [MODIFY] [apps/web/components/RoutePlannerCard.tsx](apps/web/components/RoutePlannerCard.tsx)
- Đổi các input điểm đi/đến sang viền màu Electric Blue.
- Tích hợp bộ chọn `FluidDropdown` cho phần lựa chọn thời tiết và bộ lọc ưu tiên.
- Áp dụng `PremiumCta` cho nút tìm kiếm chính.

#### [MODIFY] [apps/web/components/MapPanel.tsx](apps/web/components/MapPanel.tsx)
- Nâng cấp sơ đồ mạng lưới ga hoạt họa ban đầu (Electric Blue cho Metro Line 1, Vibrant Green cho các nhánh Bus).
- Nâng cấp đường polyline trên bản đồ địa lý thực: Metro vẽ bằng nét đôi phát sáng Electric Blue, Bus vẽ bằng Vibrant Green.

#### [MODIFY] [apps/web/components/RouteResultsSheet.tsx](apps/web/components/RouteResultsSheet.tsx)
- Định dạng thẻ kết quả boarding pass theo tông Urban Beige và Electric Blue chủ đạo.

---

### 4. Tài liệu ghi nhận ý tưởng (`docs/UI_INSPIRATION_LOG.md`)

#### [NEW] [docs/UI_INSPIRATION_LOG.md](docs/UI_INSPIRATION_LOG.md)
- Lưu trữ tài liệu phân tích ý tưởng thiết kế, so sánh các lựa chọn chuyển động, ghi chú khả năng tương thích tiếp cận (Accessibility) và tối ưu hóa hiệu năng thiết bị di động.

---

## Verification Plan

### Automated Tests
- Chạy `npm run test` để đảm bảo 100% test case Vitest Dijkstra định tuyến vẫn vượt qua thuận lợi.

### Manual Verification
1. Chạy `npm run build` để kiểm chứng biên dịch sạch hoàn toàn.
2. Chạy `npm run dev` để kiểm thử tương tác thực tế:
   - Di chuyển chuột trên Header để xem hiệu ứng di chuyển của nút pill.
   - Nhấn vào bộ chọn Thời tiết để xem hộp thả hoạt họa FluidDropdown đóng mở bằng phím Escape và click-outside.
   - Kiểm thử tìm đường Bến Thành $\rightarrow$ Thảo Điền hoạt động trơn tru.
   - Xác thực giao diện responsive trên mobile 390px mượt mà, không bị lag hay giật hình.
