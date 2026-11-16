# SilentStation / Trạm An

React 19 + Vite 6, Express/Vercel API dùng chung core, PostgreSQL/Neon. Production target: Vercel Hobby + Neon, Cloudflare maintenance mặc định **tắt**. Local 4189 không tự đổi DB hoặc restart khi build/test.

## Kiểm thử và bàn giao
Dùng Node 22, PostgreSQL 16 và OpenSSL đã cài. Không cần container runtime. Mọi DB fixture/integration là disposable/loopback riêng; không dùng Neon hoặc DB đang phục vụ preview.

```sh
npm ci
npm run lint
npm test
npm run test:integration
npm run test:native
npm run package:acceptance
```

Xem [native/cloud runbook](docs/implementation/NATIVE_ACCEPTANCE_RUNBOOK.md), [development](docs/implementation/DEVELOPMENT.md), [deployment](DEPLOY_AUTH_BACKEND.md) và [role guides](docs/user-guides/student.md).

`SURVEY_REAL_COLLECTION_ENABLED=false` giữ nguyên. Migrations/fixtures không chạy trong request/startup/health. Credential chỉ theo project, không VITE_ secret, không push/deploy/activate scheduler/migrate cloud khi chưa có ủy quyền. Archive/evidence cũ là lịch sử, không dùng làm runbook hiện hành.

## Predeploy 1.1.1 / phục hồi tài khoản

Xem `docs/implementation/PREDEPLOY_111.md`: bounded API packaging, strict Neon baseline,
CLI dry-run phục hồi tài khoản chính thức và các checkpoint Production chưa thực hiện.
Không dùng seed/fixture initializer để tạo tài khoản trên DB thật.

### Giao diện gọn — cập nhật theo yêu cầu vận hành
- Không hiển thị banner TEST/DEMO hoặc dòng kết nối API khi backend khỏe.
  Cảnh báo backend chưa sẵn sàng/mất kết nối vẫn được giữ.
- Bộ chuyển vai trò chỉ tồn tại trong demo mode, ở chân trang. Production không
  có bộ chuyển vai trò hoặc fallback đăng nhập.
- Việc bỏ banner không đổi `is_qa`, provenance, quyền, nội dung/scoring/consent
  hoặc các gate thu dữ liệu. Nhãn TEST/QA từng bản ghi và dữ liệu fixture vẫn
  được tách biệt; không seed dữ liệu kiểm thử vào Production.
- Flag fixture lịch sử `VITE_ACCEPTANCE_BANNER` không còn tạo banner giao diện.
  Không dùng sự hiện diện/vắng mặt banner làm bằng chứng môi trường hoặc quyền.
