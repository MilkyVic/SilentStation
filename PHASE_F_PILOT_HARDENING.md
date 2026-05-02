# Phase F - Pilot va Hardening (800 user)

## 1) Muc tieu
- Chay pilot 1 truong quy mo ~800 user.
- Do hieu nang API `submit` va `reports/overview`.
- Chot quy trinh monitor, backup va incident response truoc khi mo rong.

## 2) Cong cu da co san
- Load test script: `server/loadtest/pilot-800.ts`
- NPM script: `npm run loadtest:pilot`
- Ops endpoint:
  - `GET /api/tests/ops/summary?hours=24`
  - Yeu cau role `Admin` hoac `Superadmin`.

## 3) Cach chay load test
### 3.1 Chuan bi
- Chay API local: `npm run dev:api`
- Dam bao DB da ket noi (`DATABASE_URL`) va co user test:
  - `student_test / 123456`
  - `teacher_test / 123456` (dung de test endpoint report)

### 3.2 Chay lenh mac dinh (800 request submit)
```bash
npm run loadtest:pilot
```

### 3.3 Bien moi truong co the tuy chinh
- `LOADTEST_BASE_URL` (default: `http://localhost:3001`)
- `LOADTEST_VIRTUAL_USERS` (default: `800`)
- `LOADTEST_SUBMIT_CONCURRENCY` (default: `80`)
- `LOADTEST_REPORT_REQUESTS` (default: `120`)
- `LOADTEST_REPORT_CONCURRENCY` (default: `20`)
- `LOADTEST_TEMPLATE_ID` (default: `1`)

Vi du:
```bash
LOADTEST_BASE_URL=https://your-vercel-domain.vercel.app LOADTEST_VIRTUAL_USERS=800 npm run loadtest:pilot
```

## 4) KPI de pass pilot
- Submit `p95 < 500ms`
- Ty le fail submit `< 2%`
- Dashboard/report API khong tra ve 5xx hang loat trong giai doan test.

Neu script in `CHECK_REQUIRED`:
- Tang database pool/plan.
- Giam query `limit` report.
- Bat cache tai lop frontend cho report.
- Chia tai theo dot (batch) thay vi burst.

## 5) Monitoring checklist
- Theo doi:
  - Ty le HTTP 5xx
  - Latency p95 endpoint:
    - `/api/tests/submit`
    - `/api/tests/reports/overview`
  - DB CPU, connections, slow queries
- Dung endpoint:
  - `/api/tests/ops/summary?hours=1`
  - `/api/tests/ops/summary?hours=24`

## 6) Backup va restore (PostgreSQL)
### Backup
```bash
pg_dump "$DATABASE_URL" -Fc -f backup_tram_an_YYYYMMDD.dump
```

### Restore
```bash
pg_restore -d "$DATABASE_URL" --clean --if-exists backup_tram_an_YYYYMMDD.dump
```

Khuyen nghi:
- Backup hang ngay (retention toi thieu 7 ngay).
- Test restore it nhat 1 lan/2 tuan.

## 7) Incident runbook (rut gon)
- Sev-1: Dang nhap/submit loi hang loat, mat du lieu, 5xx cao lien tuc.
- Sev-2: Cham, fail rat nho, anh huong mot phan user.

Quy trinh:
1. Xac nhan pham vi anh huong (submit hay report).
2. Bat che do giam tai:
   - Giam tac vu report nang.
   - Giam concurrency client.
3. Kiem tra DB connection + CPU + lock.
4. Neu can: rollback release gan nhat.
5. Lap bien ban: nguyen nhan goc, cach khac phuc, hanh dong phong ngua.

