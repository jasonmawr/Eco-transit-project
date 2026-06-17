# Quy trình Quản lý Nhánh Git (Git Workflow) — Lướt Khói Chạm Xanh

Tài liệu này định nghĩa quy trình làm việc với Git (Git Workflow) chuẩn dành cho dự án **Lướt Khói Chạm Xanh — EcoTransit** nhằm đảm bảo tính ổn định của mã nguồn, phục vụ bàn giao và phát triển bền vững.

---

## 1. Cấu trúc Nhánh (Branching Strategy)

Dự án áp dụng mô hình Git Flow rút gọn với các nhánh chính và nhánh tạm thời:

### Nhánh Chính (Long-lived Branches)
* **`main`**:
  * **Trạng thái**: Stable / Production-ready.
  * Chứa mã nguồn đã được khách hàng phê duyệt (approved client handoff / demo approved).
  * **Quy tắc**: Tuyệt đối không commit trực tiếp lên `main` sau lượt import ban đầu. Mã nguồn chỉ được đưa vào `main` thông qua Pull Request (PR) từ nhánh `develop` (khi ra mắt phiên bản mới) hoặc từ `hotfix/*` (khi sửa lỗi khẩn cấp).
* **`develop`**:
  * **Trạng thái**: Integration / Development.
  * Nhánh tích hợp chính cho các tính năng đang phát triển.
  * Mọi lập trình viên sẽ tạo nhánh con từ `develop` và merge ngược lại vào `develop` sau khi hoàn thành.

### Nhánh Tạm Thời (Supporting Branches)
* **`feature/<scope-hoac-ticket-id>`**:
  * Dùng để phát triển tính năng mới (ví dụ: `feature/route-history`, `feature/avatar-customizer`).
  * Tạo từ: `develop`.
  * Merge lại vào: `develop` thông qua Pull Request.
* **`fix/<scope-hoac-ticket-id>`**:
  * Dùng để sửa lỗi thông thường phát hiện trong quá trình kiểm thử trên môi trường phát triển.
  * Tạo từ: `develop`.
  * Merge lại vào: `develop`.
* **`hotfix/<scope-hoac-ticket-id>`**:
  * Dùng để sửa các lỗi nghiêm trọng phát sinh trực tiếp trên môi trường production/demo.
  * Tạo từ: `main`.
  * Merge lại vào: Cả `main` và `develop` để đảm bảo đồng bộ.
* **`release/<version-tag>`**:
  * Nhánh chuẩn bị đóng gói phiên bản trước khi merge vào `main` (ví dụ: `release/v1.0.0`).
  * Tạo từ: `develop`.
  * Merge lại vào: C cả `main` (kèm tag phiên bản) và `develop`.

---

## 2. Quy tắc Commit & Merge (Development Checklist)

Trước khi thực hiện merge bất kỳ nhánh nào (đặc biệt là PR vào `develop` hoặc `main`):
1. **Kiểm tra biên dịch**: Chạy biên dịch dự án cục bộ để đảm bảo không lỗi cú pháp hoặc build lỗi:
   ```bash
   npm run build
   ```
2. **Kiểm tra kiểm thử**: Chạy toàn bộ test suite để đảm bảo tất cả các test pass 100%:
   ```bash
   npm run test
   ```
3. **Tuyệt đối không commit Secrets**:
   * Không commit các file môi trường thật chứa thông tin nhạy cảm: `.env`, `.env.local`, `.env.demo`.
   * Luôn sử dụng các file `.env.example` để làm mẫu cấu hình.
   * Danh sách các biến cần tuyệt đối bảo mật: `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `JWT_SECRET`, GitHub tokens, Neon API keys, v.v.

---

## 3. Quản lý Phiên bản & Tag (Versioning & Tagging)

* Đánh tag các bản phát hành chính thức hoặc bản demo bàn giao trên nhánh `main`.
* Định dạng tag chuẩn: `vX.Y.Z` hoặc `vX.Y.Z-<suffix>` (ví dụ: `v1.0.0-client-demo`).
* Lệnh đánh tag cục bộ và đẩy lên GitHub:
  ```bash
  git tag -a v1.0.0-client-demo -m "Lướt Khói Chạm Xanh — client handoff demo approved"
  git push origin v1.0.0-client-demo
  ```

---

## 4. Hướng dẫn thiết lập Branch Protection trên GitHub

Để đảm bảo an toàn tối đa cho nhánh `main`, Operator/Admin cần cấu hình Branch Protection trên GitHub UI:
1. Truy cập GitHub Repo: [Eco-transit-project](https://github.com/jasonmawr/Eco-transit-project) -> **Settings** -> **Branches**.
2. Tại mục **Branch protection rules**, nhấn **Add branch protection rule**.
3. Điền **Branch name pattern**: `main`.
4. Bật các tùy chọn sau:
   - [x] **Require a pull request before merging**: Bắt buộc tạo Pull Request trước khi trộn code, hạn chế commit thẳng.
   - [x] **Require approvals**: Yêu cầu tối thiểu 1-2 người duyệt code trước khi merge.
   - [x] **Require status checks to pass before merging** (nếu có CI/CD tự động như GitHub Actions): Đảm bảo build/test pass trên CI trước khi merge.
   - [x] **Do not allow bypassing the above settings**: Áp dụng luật này cho cả Admin/Owner.
   - [x] **Restrict who can push to matching branches**: Giới hạn người có quyền merge/push trực tiếp.
5. Nhấn **Save changes**.
