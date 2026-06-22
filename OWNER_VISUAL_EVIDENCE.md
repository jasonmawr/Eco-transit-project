# EcoTransit RC2 — Owner Visual Evidence closeout

Tài liệu này tổng hợp toàn bộ bằng chứng hình ảnh (Visual Evidence) thực tế của chiến dịch **EcoTransit - Lướt Khói Chạm Xanh** chạy tại final commit HEAD để phục vụ Owner duyệt trực tiếp.

## Release Status Check
```txt
READY FOR OWNER FINAL VISUAL + INTEGRATED UAT
MERGE / DEPLOY / TAG: FORBIDDEN
PRODUCTION EMAIL VERIFICATION: BLOCKED BY OWNER SMTP CONFIGURATION
```

---

## Danh sách Bằng chứng Visual (Visual Evidence Manifest)

| Artifact | Điều Owner cần nhìn thấy | Viewport | Final SHA |
| :--- | :--- | :--- | :--- |
| [01-avatar-picker-desktop.png](evidence/epic10/01-avatar-picker-desktop.png) | Giao diện tùy chỉnh nhân vật đồng hành trên Desktop hiển thị đủ 5 illustrated character cards, không chứa emoji/object ở lựa chọn chính. | Desktop (1280x800) | `99d68ae2de1b23dc412ca96d91d0d03e9c6c8361` |
| [02-avatar-picker-mobile-390.png](evidence/epic10/02-avatar-picker-mobile-390.png) | Giao diện tùy chỉnh nhân vật đồng hành hiển thị responsive đầy đủ trên thiết bị di động. | Mobile (390x800) | `99d68ae2de1b23dc412ca96d91d0d03e9c6c8361` |
| [03-avatar-preview-hair-outfit-accessory.png](evidence/epic10/03-avatar-preview-hair-outfit-accessory.png) | Tóc (short -> curly), trang phục (casual -> zip jacket), phụ kiện (backpack -> eyeglasses) thay đổi hình ảnh SVG inline thực tế (preset trước -> sau). | Desktop (1280x800) | `99d68ae2de1b23dc412ca96d91d0d03e9c6c8361` |
| [04-avatar-on-metro-hub.png](evidence/epic10/04-avatar-on-metro-hub.png) | Nhân vật đồng hành đã chọn xuất hiện và di chuyển trực tiếp trên tàu Metro Hub, không bị che navigation rail, tab hay các nút bấm CTA chính. | Desktop (1280x800) | `99d68ae2de1b23dc412ca96d91d0d03e9c6c8361` |
| [05-hub-train-before-switch.png](evidence/epic10/05-hub-train-before-switch.png) | Trạng thái tàu Metro Hub tại ga hiện tại trước khi thực hiện chuyển đổi nhanh. | Desktop (1280x800) | `99d68ae2de1b23dc412ca96d91d0d03e9c6c8361` |
| [06-hub-train-after-switch.png](evidence/epic10/06-hub-train-after-switch.png) | Trạng thái tàu Metro Hub tại ga đích sau khi thực hiện chuyển đổi nhanh. | Desktop (1280x800) | `99d68ae2de1b23dc412ca96d91d0d03e9c6c8361` |
| [07-train-rapid-switch.webm](evidence/epic10/07-train-rapid-switch.webm) | Video UAT ghi lại hành trình tàu Metro trượt mượt mà (Spring animation) khi click nhanh qua 4 ga liên tiếp mà không bị giật lag hay chồng chéo animation. | Desktop (1280x800) | `99d68ae2de1b23dc412ca96d91d0d03e9c6c8361` |
| [08-xanhwrap-rules-preview.png](evidence/epic10/08-xanhwrap-rules-preview.png) | Biểu mẫu Tạo XanhWrap hiển thị đầy đủ thể lệ minigame chính thức, trường nhập thời gian tự do, cùng thông báo lỗi validator tiếng Việt thân thiện. | Desktop (1280x800) | `99d68ae2de1b23dc412ca96d91d0d03e9c6c8361` |
| [09-leaderboard-privacy-ui.png](evidence/epic10/09-leaderboard-privacy-ui.png) | Bảng xếp hạng điểm di chuyển xanh hiển thị an toàn: chỉ gồm hạng, biệt danh ẩn danh và chỉ báo isMe của người dùng hiện tại, ẩn hoàn toàn email hay ID nhạy cảm. | Desktop (1280x800) | `99d68ae2de1b23dc412ca96d91d0d03e9c6c8361` |
| [10-map-first-click-route.png](evidence/epic10/10-map-first-click-route.png) | Bản đồ tìm kiếm đường đi hiển thị đầy đủ đường đi định tuyến Dijkstra ngay lần nhấp chuột đầu tiên. | Desktop (1280x800) | `99d68ae2de1b23dc412ca96d91d0d03e9c6c8361` |
| [11-header-responsive-1366.png](evidence/epic10/11-header-responsive-1366.png) | Thanh menu điều hướng (Navigation rail) hiển thị hoàn chỉnh, không bị cắt hay che mất nội dung ở chiều rộng màn hình 1366px. | Desktop (1366x768) | `99d68ae2de1b23dc412ca96d91d0d03e9c6c8361` |
| [12-header-responsive-1440.png](evidence/epic10/12-header-responsive-1440.png) | Thanh menu điều hướng (Navigation rail) hiển thị hoàn chỉnh ở chiều rộng màn hình 1440px. | Desktop (1440x900) | `99d68ae2de1b23dc412ca96d91d0d03e9c6c8361` |
| [13-header-responsive-1920.png](evidence/epic10/13-header-responsive-1920.png) | Thanh menu điều hướng (Navigation rail) hiển thị hoàn chỉnh ở chiều rộng màn hình 1920px. | Desktop (1920x1080) | `99d68ae2de1b23dc412ca96d91d0d03e9c6c8361` |
| [14-header-responsive-390.png](evidence/epic10/14-header-responsive-390.png) | Thanh menu điều hướng hỗ trợ kéo trượt ngang (drag-to-scroll) mượt mà trên giao diện điện thoại. | Mobile (390x800) | `99d68ae2de1b23dc412ca96d91d0d03e9c6c8361` |
| [15-ticket-reversal-blocked-message.png](evidence/epic10/15-ticket-reversal-blocked-message.png) | Giao diện admin hiển thị thông báo lỗi chặn rollback điểm thưởng khi người dùng đã tiêu dùng vượt quá số dư ví điểm xanh. | Desktop (1280x800) | `99d68ae2de1b23dc412ca96d91d0d03e9c6c8361` |

> [!NOTE]
> Các tệp bằng chứng visual trên được lưu trữ cục bộ dưới dạng untracked local UAT artifact tại thư mục `evidence/epic10/` của dự án để đảm bảo tính gọn nhẹ của kho lưu trữ mã nguồn.
