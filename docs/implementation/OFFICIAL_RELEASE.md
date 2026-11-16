> HISTORICAL RECORD — Các bước triển khai/acceptance cũ đã được thay bằng native/Vercel–Neon. Không chạy theo runbook này. Xem docs/implementation/NATIVE_ACCEPTANCE_RUNBOOK.md; code/phiếu/version lịch sử không bị đổi.

# SilentStation 1.0.1 — phiên bản chính thức của phần mềm

- Package/app version: `1.0.1`.
- Definition mặc định: `student-mental-health-v1`; consent: `survey-consent-v1`.
- Nội dung/mã câu/options A–J giữ nguyên; không tự đổi ngưỡng hay phê duyệt chuyên môn.
- `survey-arithmetic-v1` vẫn là version thuật toán hiện tại. Software release không tự biến arithmetic thành diễn giải lâm sàng.
- Phiên bản lịch sử `student-mental-health-v1-draft` được đóng băng, vẫn đọc/resume/export/in theo đúng snapshot/consent cũ ở đợt kiểm thử; không sửa row hay chấm lại lịch sử. Nó không được mở đợt thu thật.
- Quản trị mặc định tạo campaign chính thức (`isDemo=false`), ở trạng thái chưa mở. Đợt kiểm thử có lựa chọn riêng, không trộn dữ liệu.
- Hồ sơ phê duyệt và thời hạn lưu mặc định trống/false; người có quyền ghi nhận quyết định đã có. Không tự đặt true khi phát hành 1.0.0.
- `SURVEY_REAL_COLLECTION_ENABLED=false` giữ mặc định. Chỉ đổi trên môi trường đã được lựa chọn và ủy quyền, với đầy đủ hồ sơ/retention/quyền dùng phiếu và evidence vận hành.
- Acceptance Compose vẫn có banner TEST/Mailpit/DB giả. Không đổi stack đó thành production bằng cách tắt banner hoặc chỉnh một flag.
- Nháp học sinh 24h vẫn được giữ; đó là chức năng autosave/resume, không phải nhãn phiên bản dự thảo.
- Không có deployment/production migration/thu dữ liệu người thật trong thay đổi này. Raw-response retention/withdrawal, production provisioning/domain/accounts và phê duyệt vẫn là các gate vận hành riêng.

## Thao tác trong quản trị

Tạo đợt chính thức → lưu tham chiếu phê duyệt/thời hạn lưu và xác nhận quyết định của người phụ trách → server production được cho phép riêng → mở đợt → cấp grant read/export riêng → phân phối link/QR. Tạo đợt không tự mở thu hoặc cấp raw grant.

## Kiểm chứng local

Node 22.23.5: 37 unit tests pass (hai harness DB được skip trong lệnh unit), 30 integration tests pass trên cluster PostgreSQL disposable riêng. Luồng campaign `isDemo=false` được test với dữ liệu giả: thiếu bất kỳ gate nào bị từ chối; đủ gate thì lưu receipt/version đúng. Không bật flag trên DB thật. Build production/demo/API/acceptance và UI admin 320/390/768/1280px đã kiểm tra; Docker/E2E production thực tế chưa chạy.

### Patch 1.0.1

Không thay đổi phiếu A–J/scoring/consent. Sửa editor, contract nháp test cũ/version/retry, async isolation, grant/policy, truthful unavailable/report states và dependency. Legacy score_version giữ legacy-arithmetic-v2; kết quả mới bổ sung provenance/full snapshot, không sửa lịch sử. Client cũ thiếu contract ghi bị từ chối rõ ràng.
