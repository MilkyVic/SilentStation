# SilentStation — runbook Docker acceptance trên máy riêng

**Đây là stack TEST. Không nhập dữ liệu học sinh/người thật. Không phải deployment/pilot production.**

## 1. Ranh giới và điều kiện

Bạn là người chạy các bước remote. Không cần cung cấp SSH, GitHub, Gmail, Gemini hoặc credential production cho assistant. Package chứa source hiện tại (cả file chưa tracked), không chứa `.git`, `.env`, dữ liệu DB, certificate/private key hoặc node_modules của Mac.

Máy chạy cần Python 3, Docker với Linux containers amd64/arm64, Compose >=2.24, engine RAM >=8GiB, >=2 CPU, disk workspace >=8GiB. Trên máy dùng chung, **xác nhận riêng >=2 CPU và >=6GiB RAM còn dư**; không dừng container khác để lấy tài nguyên. Build giới hạn Compose parallelism=1; không có benchmark 800 người.

Không tự cài Docker, đổi Docker context, thêm CA toàn cục, sửa firewall/reverse proxy, mount DB cũ, đăng nhập registry hay push GitHub. Runbook từ chối Docker endpoint remote khi đang chạy trên host khác: hãy chạy tại máy Docker đã chọn, không đổi context tự động.

## 2. Nhận package và kiểm tra chỉ đọc

Chuyển archive và file `.sha256` bằng phương thức bạn đang dùng. Kiểm checksum trước khi giải nén:

```sh
# Linux:
sha256sum -c silentstation-backend-acceptance-<snapshot-id>.tar.gz.sha256
# macOS tương đương: shasum -a 256 -c <file>.sha256

# Dùng folder mới, không giải nén đè project có sẵn.
mkdir "$HOME/silentstation-acceptance-<snapshot-id>"
tar -xzf silentstation-backend-acceptance-<snapshot-id>.tar.gz \
  -C "$HOME/silentstation-acceptance-<snapshot-id>"
cd "$HOME/silentstation-acceptance-<snapshot-id>/SilentStation"
python3 scripts/acceptance.py verify
python3 scripts/acceptance.py preflight
```

`verify` đối chiếu SHA-256 từng file và snapshot ID; `preflight` kiểm tra daemon, context, Compose, architecture, tài nguyên, config và cổng 8443. Hai bước này không tạo stack/DB. Nếu fail, dừng; không chỉnh file trong package để bỏ gate. Có thể làm từ checkout mới sau một bản sửa/package mới.

## 3. Tạo stack mới và kiểm thử

Chỉ chạy sau khi bạn đã chọn đúng máy và kiểm tra tài nguyên dư:

```sh
python3 scripts/acceptance.py init --confirm-spare-resources
python3 scripts/acceptance.py build
python3 scripts/acceptance.py up
python3 scripts/acceptance.py test
```

- `init` sinh secret ngẫu nhiên riêng, lưu file private mode 600. Không in password/OTP.
- `build` pull các public base image được khai báo, pin digest tại `.acceptance/images.json`, build API/tools/web/TLS/E2E; không sử dụng registry hoặc npm config của project khác.
- Namespace cố định từ manifest: `silentstation-acceptance-<snapshot-id>`. Network/volumes đều mới, không external. Chỉ web publish `127.0.0.1:8443`; DB/API/SMTP không publish.
- Secret initializer chuyển file host mode 600 sang volume private có UID/mode phù hợp; **không chmod secret host thành world-readable**.
- CA riêng, DB và SMTP chỉ dùng TLS xác minh CA/hostname. DB từ chối non-TLS. Không tắt kiểm certificate để “làm cho chạy”.
- DB healthy → migration transaction/ledger/checksum → fixture initializer trên DB trống → API ready → web/maintenance. Startup/restart không migrate hoặc seed.
- Fixtures gồm bốn role, admin trường B, hai campaign `TESTA`, `TESTB`; password ngẫu nhiên. `SURVEY_REAL_COLLECTION_ENABLED=false`, definition vẫn `draft`.
- Test core dùng database phụ mới trên **chính PostgreSQL container này**, kết thúc xóa đúng database phụ; không dùng DB acceptance preview hoặc DB khác làm test destructively.
- E2E gọi API image thật, production cookies và SMTP Mailpit; Chromium trust CA trong container, không `ignoreHTTPSErrors`. Không lưu video/trace/password/OTP hoặc CSV raw vào evidence.
- Sau E2E, restart đúng API này rồi so sánh count account/campaign/response/ledger để phát hiện seed/reset ngoài ý muốn.

Nếu bất kỳ bước nào fail: **không mở preview nghiệm thu**, không chạy seed lại, không `down -v`, không drop/reset DB để che lỗi. Các job migration/fixture không phải công cụ sửa DB có sẵn. Ghi lại tên gate/status, không gửi secret/answer/OTP; có thể stop stack riêng bên dưới.

## 4. Mở preview qua tunnel sau khi test pass

```sh
python3 scripts/acceptance.py preview
```

Runbook xuất CA public và file account riêng vào `.acceptance/operator/`; không gửi folder này làm evidence. Xem account bằng editor riêng khi cần đăng nhập, không đưa password vào chat/log.

Trên Mac của bạn, dùng SSH target đã có:

```sh
ssh -N -o ExitOnForwardFailure=yes \
  -L 18443:127.0.0.1:8443 <your-existing-ssh-target>
```

- UI: `https://localhost:18443`; mã khảo sát `TESTA` hoặc `TESTB`.
- OTP email giả: `https://localhost:18443/__test/mail/`.
- Chứng chỉ là CA kiểm thử riêng. So sánh fingerprint với CA public trên máy Docker; nếu xem thủ công, chỉ chấp nhận ngoại lệ cho endpoint TEST này. Không cài CA toàn cục. E2E đã dùng trust store của container, không bỏ kiểm TLS.
- Kiểm tra readiness bằng `curl --cacert <public-ca-file> https://localhost:18443/api/ready`; **không dùng `curl -k` làm bằng chứng TLS**.
- Production frontend dùng API thật, không role switch/fallback memory. Banner TEST là thông báo, không phải cơ chế auth. Chỉ server xác nhận persistence mới báo đã lưu.

## 5. Evidence, dừng và rollback

```sh
python3 scripts/acceptance.py evidence
python3 scripts/acceptance.py stop
# Khi cần khôi phục đúng stack và secret hiện có; không chạy fixture lại:
python3 scripts/acceptance.py resume
```

Chỉ gửi `.acceptance/evidence/`: snapshot ID, image/base digest, gate results và ảnh trang chủ trống ở 320/390/768/1280. Không gửi `.acceptance/private/`, `.acceptance/operator/`, Mailpit database, credential, browser trace, responses hoặc CSV. Evidence không thu log dịch vụ chứa dữ liệu; output lỗi cần được redaction trước khi chia sẻ.

Stop giữ toàn bộ volumes. Bản acceptance đầu tiên rollback bằng stop và giữ dữ liệu để điều tra; không down-migrate. Chuyển release sau phải là bản tương thích schema và dùng snapshot mới, không ghi đè stack này. Dọn volume/image chỉ có quy trình xác nhận riêng theo label/namespace; runbook **không có `docker system prune` hoặc xóa volume tự động**.

## 6. Điều còn khóa

Nháp hết quyền truy cập đúng deadline 24 giờ. Maintenance mỗi phút xóa ciphertext hết hạn; thời điểm xóa thực tế phụ thuộc job hoạt động, không đồng nghĩa “xóa vật lý ngay tại 24h”. Không bật purge phản hồi thật trong vòng này.

Chưa nghiệm thu cho tới khi có evidence từ Docker thực tế. Chưa mở pilot cho tới khi duyệt phiếu/scoring, consent, retention, quyền sử dụng, grantees và hỗ trợ thực tế. SMTP/Gemini thật, Vercel deployment, load acceptance 800 người và canary production không nằm trong vòng này.
