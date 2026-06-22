# EcoTransit RC2 — Owner Visual Evidence Manifest

Tài liệu này tổng hợp toàn bộ bằng chứng hình ảnh (Visual Evidence) thực tế của chiến dịch **EcoTransit - Lướt Khói Chạm Xanh** chạy tại final commit HEAD để phục vụ Owner duyệt trực tiếp.

## Release Status Check
```txt
READY FOR OWNER RESUME FINAL UAT
MERGE / DEPLOY / TAG: FORBIDDEN
PRODUCTION EMAIL VERIFICATION: BLOCKED BY OWNER SMTP CONFIGURATION
```

---

## Danh sách Bằng chứng Visual (Visual Evidence Manifest)

| Artifact | Điều Owner cần nhìn thấy | Viewport |
| :--- | :--- | :--- |
| [01-avatar-picker-desktop.png](evidence/epic10/01-avatar-picker-desktop.png) | Giao diện tùy chỉnh nhân vật đồng hành trên Desktop hiển thị đủ 5 illustrated character cards, không chứa emoji/object ở lựa chọn chính. | Desktop (1280x800) |
| [02-avatar-picker-mobile-390.png](evidence/epic10/02-avatar-picker-mobile-390.png) | Giao diện tùy chỉnh nhân vật đồng hành hiển thị responsive đầy đủ trên thiết bị di động. | Mobile (390x800) |
| [03-avatar-preview-hair-outfit-accessory.png](evidence/epic10/03-avatar-preview-hair-outfit-accessory.png) | Tóc (short -> curly), trang phục (casual -> zip jacket), phụ kiện (backpack -> eyeglasses) thay đổi hình ảnh SVG inline thực tế (preset trước -> sau). | Desktop (1280x800) |
| [04-avatar-on-real-metro-hub.png](evidence/epic10/04-avatar-on-real-metro-hub.png) | Nhân vật đồng hành đã chọn xuất hiện và di chuyển trực tiếp trên tàu Metro hai toa thật, không bị che navigation rail, tab hay các nút bấm CTA chính. | Desktop (1280x800) |
| [05-real-metro-before-switch.png](evidence/epic10/05-real-metro-before-switch.png) | Trạng thái tàu Metro hai toa thực tế tại ga hiện tại trước khi thực hiện chuyển đổi nhanh. | Desktop (1280x800) |
| [06-real-metro-mid-transition-no-overlap.png](evidence/epic10/06-real-metro-mid-transition-no-overlap.png) | Trạng thái tàu Metro hai toa đang di chuyển ở giữa hành trình chuyển đổi ga (mid-frame), chứng minh không đè lên hay giao cắt với bất kỳ station icons hay labels nào. | Desktop (1280x800) |
| [07-real-metro-rapid-switch.webm](evidence/epic10/07-real-metro-rapid-switch.webm) | Video UAT ghi lại hành trình tàu Metro hai toa trượt mượt mà (RAF easeOutCubic gliding) khi click nhanh qua 4 ga liên tiếp mà không bị giật lag hay chồng chéo animation, xuất phát đúng từ vị trí hiện tại. | Desktop (1280x800) |
| [08-real-metro-mobile-no-overlap.png](evidence/epic10/08-real-metro-mobile-no-overlap.png) | Giao diện di động (viewport 390) hiển thị tàu Metro hai toa di chuyển dọc theo làn đường ray bên phải, hoàn toàn tách biệt hình học và không đè lên các nút bấm/tiêu đề ga ở bên trái. | Mobile (390x800) |
| [09-leaderboard-privacy-ui.png](evidence/epic10/09-leaderboard-privacy-ui.png) | Bảng xếp hạng điểm di chuyển xanh hiển thị an toàn: chỉ gồm hạng, biệt danh ẩn danh và chỉ báo isMe của người dùng hiện tại, ẩn hoàn toàn email hay ID nhạy cảm. | Desktop (1280x800) |
| [10-map-first-click-route.png](evidence/epic10/10-map-first-click-route.png) | Bản đồ tìm kiếm đường đi hiển thị đầy đủ đường đi định tuyến Dijkstra ngay lần nhấp chuột đầu tiên. | Desktop (1280x800) |
| [11-header-responsive-1366.png](evidence/epic10/11-header-responsive-1366.png) | Thanh menu điều hướng (Navigation rail) hiển thị hoàn chỉnh, không bị cắt hay che mất nội dung ở chiều rộng màn hình 1366px. | Desktop (1366x768) |
| [12-header-responsive-1440.png](evidence/epic10/12-header-responsive-1440.png) | Thanh menu điều hướng (Navigation rail) hiển thị hoàn chỉnh ở chiều rộng màn hình 1440px. | Desktop (1440x900) |
| [13-header-responsive-1920.png](evidence/epic10/13-header-responsive-1920.png) | Thanh menu điều hướng (Navigation rail) hiển thị hoàn chỉnh ở chiều rộng màn hình 1920px. | Desktop (1920x1080) |
| [14-header-responsive-390.png](evidence/epic10/14-header-responsive-390.png) | Thanh menu điều hướng hỗ trợ kéo trượt ngang (drag-to-scroll) mượt mà trên giao diện điện thoại. | Mobile (390x800) |
| [15-ticket-reversal-blocked-message.png](evidence/epic10/15-ticket-reversal-blocked-message.png) | Giao diện admin hiển thị thông báo lỗi chặn rollback điểm thưởng khi người dùng đã tiêu dùng vượt quá số dư ví điểm xanh. | Desktop (1280x800) |
| [16-route-workspace-1366-top.png](evidence/epic10/16-route-workspace-1366-top.png) | Vùng tương tác Lộ trình nhìn từ trên xuống ở viewport 1366x768 (không collapse Hub), chứng minh các panel, form, và map xếp đặt cân đối, rõ ràng. | Desktop (1366x768) |
| [17-route-workspace-1366-result-scrolled-bottom.png](evidence/epic10/17-route-workspace-1366-result-scrolled-bottom.png) | Vùng tương tác Lộ trình cuộn xuống dưới ở viewport 1366x768, chứng minh thanh cuộn hiển thị rõ ràng cho phép xem kết quả tìm kiếm và footer không che phủ CTA. | Desktop (1366x768) |
| [18-route-workspace-1440.png](evidence/epic10/18-route-workspace-1440.png) | Workspace lộ trình hiển thị cân đối và tự giãn rộng theo viewport ở độ phân giải 1440x900. | Desktop (1440x900) |
| [19-route-workspace-1920.png](evidence/epic10/19-route-workspace-1920.png) | Workspace lộ trình hiển thị cân đối ở độ phân giải 1920x1080. | Desktop (1920x1080) |
| [20-route-workspace-390.png](evidence/epic10/20-route-workspace-390.png) | Workspace lộ trình di động cân đối, touch được map, inputs và CTA, không bị nested scroll lỗi. | Mobile (390x800) |
| [21-xanhwrap-workspace-1366.png](evidence/epic10/21-xanhwrap-workspace-1366.png) | Workspace XanhWrap hiển thị đầy đủ form và rules ở viewport 1366x768. | Desktop (1366x768) |
| [22-rewards-workspace-1366.png](evidence/epic10/22-rewards-workspace-1366.png) | Workspace Đổi Thưởng hiển thị đầy đủ voucher grids ở viewport 1366x768. | Desktop (1366x768) |

> [!NOTE]
> Các tệp bằng chứng visual trên được lưu trữ cục bộ dưới dạng untracked local UAT artifact tại thư mục `evidence/epic10/` của dự án.
