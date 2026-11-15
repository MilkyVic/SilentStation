import React, { Suspense, lazy, useEffect, useState } from 'react';
import { HashRouter, NavLink, Route, Routes, Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, ShieldCheck, Lock } from 'lucide-react';
import type { AuthAccount, AuthRole } from './types/auth';
import { authService } from './services/authService';
import { DEMO_MODE } from './services/surveyService';
import HomePage from './features/shell/HomePage';
import ContactPage from './features/shell/ContactPage';
const SurveyPage = lazy(() => import('./features/survey/SurveyPage'));
const SurveyAdminPage = lazy(() => import('./features/survey/SurveyAdminPage'));
const HandbookPage = lazy(() => import('./features/shell/HandbookPage'));
const ChatPanel = lazy(() => import('./features/shell/ChatPanel'));
const AuthView = lazy(() => import('./components/auth/AuthView'));
const LegacyApp = lazy(() => import('./LegacyApp'));
const roles: AuthRole[] = ['Học sinh', 'Giáo viên', 'Admin', 'Quản trị viên cấp cao'];
function AppShell() {
    const [account, setAccount] = useState<AuthAccount | null>(null), [menu, setMenu] = useState(false), [role, setRole] = useState('guest'), [fixtures, setFixtures] = useState<any>(), [authLoading, setAuthLoading] = useState(!DEMO_MODE), [authError, setAuthError] = useState(''), [schools, setSchools] = useState<{
        id: string;
        name: string;
    }[]>([]);
    const location = useLocation();
    useEffect(() => { if (!DEMO_MODE)
        fetch('/api/auth/schools', { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(data => setSchools(data?.schools ?? [])).catch(() => setSchools([])); }, []);
    useEffect(() => { setMenu(false); window.scrollTo({ top: 0, behavior: 'instant' }); }, [location.pathname]);
    useEffect(() => { if (DEMO_MODE) {
        let active = true;
        if (role === 'guest') {
            setAccount(null);
            setFixtures(undefined);
            return;
        }
        Promise.all([import('./features/demo/accounts'), import('./features/demo/legacy-fixtures')]).then(([a, d]) => { if (active) {
            setAccount(a.demoAccount(role as AuthRole));
            setFixtures(d.legacyFixtures);
        } });
        return () => { active = false; };
    } let active = true; authService.getCurrentSession().then(a => active && setAccount(a)).catch(() => active && setAuthError('Không xác nhận được phiên đăng nhập.')).finally(() => active && setAuthLoading(false)); return () => { active = false; }; }, [role]);
    async function logout() { if (!DEMO_MODE)
        await authService.logout(); setRole('guest'); setAccount(null); setFixtures(undefined); setMenu(false); }
    const management = account && (account.role === 'Admin' || account.role === 'Quản trị viên cấp cao');
    function legacy(view: string) { if (authLoading)
        return <Loading />; if (!account)
        return <Gate />; return <LegacyApp key={`${account.id}:${view}`} initialView={view as any} demoAccount={DEMO_MODE ? account : undefined} initialData={DEMO_MODE ? fixtures : undefined}/>; }
    return <div className="app-shell">{import.meta.env.VITE_ACCEPTANCE_BANNER === 'true' && <div className="demo-banner" role="status"><strong>TEST — KHÔNG NHẬP DỮ LIỆU THẬT</strong><span>Backend/DB kiểm thử riêng. Không dùng cho nghiên cứu thật.</span></div>}{DEMO_MODE && <div className="demo-banner"><strong>DEMO · KHÔNG NHẬP DỮ LIỆU THẬT</strong><span>Giao diện mô phỏng; nháp demo không lưu bền vững.</span><label>Vai trò <select aria-label="Vai trò demo" value={role} onChange={e => setRole(e.target.value)}><option value="guest">Khách · khảo sát ẩn danh</option>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></label></div>}
 <header className="site-header"><div className="nav-pill"><Link className="brand" to="/" aria-label="Trang chủ Trạm An"><img src="/assets/surveys/logo.webp" alt="Trạm An"/></Link><nav className={`primary-nav ${menu ? 'nav-open' : ''}`} aria-label="Điều hướng chính"><NavLink to="/" end>Trang chủ</NavLink><NavLink to="/cam-nang">Cẩm nang</NavLink><NavLink to="/khao-sat">Khảo sát</NavLink><NavLink to="/bai-danh-gia">Bài tự đánh giá</NavLink><NavLink to="/lien-he">Liên hệ</NavLink></nav><div className="account-nav">{account ? <><Link className="account-link" to="/tai-khoan">{account.role}</Link><button className="icon-button" aria-label="Đăng xuất" onClick={() => void logout()}><LogOut size={18}/></button></> : <Link className="login-link" to="/dang-nhap"><LogIn size={16}/><span>Đăng nhập</span></Link>}<button aria-label={menu ? 'Đóng menu' : 'Mở menu điều hướng'} aria-expanded={menu} className="icon-button mobile-toggle" onClick={() => setMenu(v => !v)}>{menu ? <X /> : <Menu />}</button></div></div></header>
 {account?.role === 'Giáo viên' && <nav className="management-nav" aria-label="Khu vực giáo viên"><NavLink to="/quan-tri">Khu vực của tôi</NavLink><NavLink to="/bai-danh-gia">Bài tự đánh giá</NavLink><NavLink to="/tai-khoan">Tài khoản</NavLink></nav>}
 {management && <nav className="management-nav" aria-label="Khu vực quản trị"><NavLink to="/nghien-cuu">Đợt khảo sát</NavLink><NavLink to="/quan-tri">Tổng quan</NavLink><NavLink to="/quan-tri/teacher-list">Giáo viên</NavLink><NavLink to="/quan-tri/class-list">Lớp học</NavLink><NavLink to="/quan-tri/reports">Báo cáo bài test</NavLink><NavLink to="/quan-tri/test-list">Quản lý bài test</NavLink></nav>}
 {authError && <div className="error-note" role="alert">{authError}</div>}
 <main className="app-main"><Suspense fallback={<Loading />}><Routes>
 <Route path="/" element={<HomePage />}/><Route path="/cam-nang" element={<HandbookPage />}/><Route path="/lien-he" element={<ContactPage />}/><Route path="/khao-sat" element={<SurveyPage />}/><Route path="/khao-sat/:code" element={<SurveyPage />}/>
 <Route path="/dang-nhap" element={DEMO_MODE ? <div className="page-wrap"><section className="surface-card"><h1>Đăng nhập · bản demo</h1><p>Dùng bộ chuyển vai trò trên thanh DEMO để xem 4 giao diện. Không có mật khẩu admin hard-code hoặc đăng nhập giả.</p></section></div> : <AuthView teacherRegCode={null} schools={schools} onBack={() => window.history.back()} onTeacherPending={() => { }} onLoginSuccess={a => { setAccount(a); window.location.hash = '/tai-khoan'; }}/>}/>
 <Route path="/bai-danh-gia" element={<section className="legacy-wrapper">{legacy('test-list')}</section>}/>
 <Route path="/tai-khoan" element={<section className="legacy-wrapper">{legacy('account')}</section>}/>
 <Route path="/nghien-cuu" element={account ? <SurveyAdminPage key={account.id} account={account}/> : <Gate />}/>
 <Route path="/quan-tri" element={management ? <section className="legacy-wrapper">{legacy(account.role === 'Quản trị viên cấp cao' ? 'superadmin' : 'admin')}</section> : account?.role === 'Giáo viên' ? <section className="legacy-wrapper">{legacy(account.profile.teacherType === 'homeroom' && account.profile.className ? 'teacher-class' : 'test-list')}</section> : <Gate />}/>
 <Route path="/quan-tri/:view" element={<ManagementRoute account={account} render={legacy}/>}/>
 <Route path="*" element={<div className="page-wrap"><section className="surface-card"><h1>Không tìm thấy trang</h1><Link to="/">Về trang chủ</Link></section></div>}/>
 </Routes></Suspense></main>
 <footer className="site-footer"><span className="font-brand">Trạm An · Lặng để lắng</span><span>Khảo sát tự nguyện · Chỉ mở đợt thật đã được duyệt</span><Link to="/lien-he">Kênh hỗ trợ</Link></footer><Suspense fallback={null}><ChatPanel key={account?.id ?? 'guest'}/></Suspense>
 </div>;
}
function Loading() { return <div className="page-wrap"><div className="surface-card" role="status">Đang mở một góc bình yên…</div></div>; }
function Gate() { return <div className="page-wrap"><section className="surface-card"><Lock /><h1>Khu vực cần tài khoản và quyền phù hợp</h1><p>Khảo sát theo mã đợt không bắt đăng nhập. Bài tự đánh giá cũ và khu vực quản trị dùng tài khoản riêng.</p><Link className="primary-button" to="/dang-nhap">Đăng nhập</Link><Link className="secondary-button" to="/khao-sat">Khảo sát ẩn danh</Link></section></div>; }
function ManagementRoute({ account, render }: {
    account: AuthAccount | null;
    render: (view: string) => React.ReactNode;
}) { const { view } = useParamsSafe(); const valid = ['admin', 'superadmin', 'admin-list', 'school-list', 'class-list', 'teacher-list', 'reports', 'test-list', 'settings']; if (!account || !['Admin', 'Quản trị viên cấp cao'].includes(account.role) || !valid.includes(view) || account.role === 'Admin' && ['superadmin', 'admin-list', 'school-list'].includes(view))
    return <Gate />; return <section className="legacy-wrapper">{render(view)}</section>; }
// Route segment is limited to the explicit management registry above.
function useParamsSafe() { const location = useLocation(); return { view: location.pathname.split('/').at(-1) ?? '' }; }
export default function App() { return <HashRouter><AppShell /></HashRouter>; }
