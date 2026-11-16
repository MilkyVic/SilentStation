import {ui,useLocale} from './features/preferences/ui';
import {PreferencesProvider,PreferencesButton} from './features/preferences/Preferences';
import {APP_RELEASE} from '../shared/release';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { HashRouter, NavLink, Route, Routes, Link, useLocation,useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, Lock } from 'lucide-react';
import type { AuthAccount, AuthRole } from './types/auth';
import { authService } from './services/authService';
import { DEMO_MODE } from './services/surveyService';
import HomePage from './features/shell/HomePage';
import ContactPage from './features/shell/ContactPage';
import BackendStatus from './features/shell/BackendStatus';
import ProfileMenu from './features/shell/ProfileMenu';
const DistributionPage=lazy(()=>import('./features/survey/DistributionPage'));
const SurveyPage = lazy(() => import('./features/survey/SurveyPage'));
const SurveyAdminPage = lazy(() => import('./features/survey/SurveyAdminPage'));
const HandbookPage = lazy(() => import('./features/shell/HandbookPage'));
const ChatPanel = lazy(() => import('./features/shell/ChatPanel'));
const AuthView = lazy(() => import('./components/auth/AuthView'));
const LegacyApp = lazy(() => import('./LegacyApp'));
const AccountPage=lazy(()=>import('./features/accounts/AccountPage'));
const ManagementPage=lazy(()=>import('./features/accounts/ManagementPage'));
const RecoveryPage=lazy(()=>import('./features/accounts/RecoveryPage'));
const roles: AuthRole[] = ['Học sinh', 'Giáo viên', 'Admin', 'Quản trị viên cấp cao'];
function AppShell() {useLocale();
    const [account, setAccount] = useState<AuthAccount | null>(null), [menu, setMenu] = useState(false), [role, setRole] = useState('guest'), [fixtures, setFixtures] = useState<any>(), [authLoading, setAuthLoading] = useState(!DEMO_MODE), [authError, setAuthError] = useState(''), [schools, setSchools] = useState<{
        id: string;
        name: string;
    }[]>([]);
    const location = useLocation(),navigate=useNavigate();
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
    async function logout(){try{if(!DEMO_MODE)await authService.logout();setRole('guest');setAccount(null);setFixtures(undefined);setMenu(false);navigate('/');}catch(e){setAuthError((e as Error).message);}}
    const management = account && (account.role === 'Admin' || account.role === 'Quản trị viên cấp cao');
    async function refreshSession(){const next=await authService.getCurrentSession();setAccount(next);if(!next)navigate('/dang-nhap');}
    function legacy(view: string) { if (authLoading)
        return <Loading />; if (!account)
        return <Gate />; if(!DEMO_MODE&&['account','settings'].includes(view))return <AccountPage key={account.id} onSessionChanged={refreshSession}/>;if(!DEMO_MODE&&['admin','superadmin','teacher-class','admin-list','school-list','teacher-list','class-list','reports'].includes(view))return <ManagementPage key={account.id+':'+view} view={['admin','superadmin','teacher-class'].includes(view)?'overview':view} onSessionChanged={refreshSession}/>;return <LegacyApp key={`${account.id}:${view}`} initialView={view as any} demoAccount={DEMO_MODE ? account : undefined} initialData={DEMO_MODE ? fixtures : undefined} onLogout={()=>void logout()} onNavigateView={next=>{const urls:Record<string,string>={home:'/',account:'/tai-khoan',settings:'/tai-khoan/settings',admin:'/quan-tri',superadmin:'/quan-tri','teacher-class':'/quan-tri','test-list':management?'/quan-tri/test-list':'/bai-danh-gia','admin-list':'/quan-tri/admin-list','school-list':'/quan-tri/school-list','teacher-list':'/quan-tri/teacher-list','class-list':'/quan-tri/class-list',reports:'/quan-tri/reports'};if(urls[next]&&urls[next]!==location.pathname)navigate(urls[next]);}}/>; }
    return <PreferencesProvider accountId={DEMO_MODE?null:account?.id??null}><div className="app-shell">{import.meta.env.VITE_ACCEPTANCE_BANNER === 'true' && <div className="demo-banner" role="status"><strong>{ui("TEST — KHÔNG NHẬP DỮ LIỆU THẬT")}</strong><span>{ui("Backend/DB kiểm thử riêng. Không dùng cho nghiên cứu thật.")}</span></div>}{DEMO_MODE && <div className="demo-banner"><strong>{ui("DEMO · KHÔNG NHẬP DỮ LIỆU THẬT")}</strong><span>{ui("Giao diện mô phỏng; nháp demo không lưu bền vững.")}</span><label>{ui("Vai trò")}{' '}<select aria-label={ui("Vai trò demo")} value={role} onChange={e => setRole(e.target.value)}><option value="guest">{ui("Khách · khảo sát ẩn danh")}</option>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></label></div>}
 <header className="site-header"><div className="nav-pill"><Link className="brand" to="/" aria-label={ui("Trang chủ Trạm An")}><img src="/assets/surveys/logo.webp" alt={ui("Trạm An")}/></Link><nav className={`primary-nav ${menu ? 'nav-open' : ''}`} aria-label={ui("Điều hướng chính")}><NavLink to="/" end>{ui("Trang chủ")}</NavLink><NavLink to="/cam-nang">{ui("Cẩm nang")}</NavLink><NavLink to="/khao-sat">{ui("Khảo sát")}</NavLink><NavLink to="/bai-danh-gia">{ui("Bài tự đánh giá")}</NavLink><NavLink to="/lien-he">{ui("Liên hệ")}</NavLink></nav><div className="account-nav"><PreferencesButton/>{account ? <ProfileMenu key={account.id} account={account} onLogout={logout} onOpen={()=>setMenu(false)}/> : <Link className="login-link" to="/dang-nhap"><LogIn size={16}/><span>{ui("Đăng nhập")}</span></Link>}<button aria-label={menu ? 'Đóng menu' : 'Mở menu điều hướng'} aria-expanded={menu} className="icon-button mobile-toggle" onClick={() => setMenu(v => !v)}>{menu ? <X /> : <Menu />}</button></div></div></header>
 {account?.role === 'Giáo viên' && <nav className="management-nav" aria-label={ui("Khu vực giáo viên")}><NavLink to="/quan-tri" end>{ui("Khu vực của tôi")}</NavLink><NavLink to="/phat-khao-sat">{ui("Phát mã khảo sát")}</NavLink><NavLink to="/bai-danh-gia">{ui("Bài tự đánh giá")}</NavLink><NavLink to="/tai-khoan">{ui("Tài khoản")}</NavLink></nav>}
 {management && <nav className="management-nav" aria-label={ui("Khu vực quản trị")}><NavLink to="/nghien-cuu">{ui("Đợt khảo sát")}</NavLink><NavLink to="/phat-khao-sat">{ui("Phát mã khảo sát")}</NavLink><NavLink to="/quan-tri" end>{ui("Tổng quan")}</NavLink><NavLink to="/quan-tri/teacher-list">{ui("Giáo viên")}</NavLink>{account.role==='Quản trị viên cấp cao'&&<><NavLink to="/quan-tri/school-list">{ui("Trường")}</NavLink><NavLink to="/quan-tri/admin-list">{ui("Admin")}</NavLink></>}<NavLink to="/quan-tri/class-list">{ui("Lớp học")}</NavLink><NavLink to="/quan-tri/reports">{ui("Báo cáo bài test")}</NavLink><NavLink to="/quan-tri/test-list">{ui("Quản lý bài test")}</NavLink></nav>}
 {authError && <div className="error-note" role="alert">{authError}</div>}
 <div className="language-content-note" hidden={document.documentElement.lang!=='en'}>Questionnaires, consent, specialist content and stored historical labels remain in Vietnamese.</div><BackendStatus/><main className="app-main"><Suspense fallback={<Loading />}><Routes>
 <Route path="/" element={<HomePage />}/><Route path="/cam-nang" element={<HandbookPage />}/><Route path="/lien-he" element={<ContactPage />}/><Route path="/khao-sat" element={<SurveyPage />}/><Route path="/khao-sat/:code" element={<SurveyPage />}/>
 <Route path="/tham-gia/:invitationCode" element={<SurveyPage/>}/><Route path="/phat-khao-sat" element={account?<DistributionPage key={account.id} account={account}/>:<Gate/>}/>
 <Route path="/khoi-phuc" element={<RecoveryPage/>}/><Route path="/dang-nhap" element={DEMO_MODE ? <div className="page-wrap"><section className="surface-card"><h1>{ui("Đăng nhập · bản demo")}</h1><p>{ui("Dùng bộ chuyển vai trò trên thanh DEMO để xem 4 giao diện. Không có mật khẩu admin hard-code hoặc đăng nhập giả.")}</p></section></div> : <AuthView teacherRegCode={null} schools={schools} onBack={() => window.history.back()} onTeacherPending={() => { }} onLoginSuccess={a => { setAccount(a); window.location.hash = '/tai-khoan'; }}/>}/>
 <Route path="/bai-danh-gia" element={<section className="legacy-wrapper">{legacy('test-list')}</section>}/>
 <Route path="/tai-khoan/settings" element={<section className="legacy-wrapper">{legacy('settings')}</section>}/><Route path="/tai-khoan" element={<section className="legacy-wrapper">{legacy('account')}</section>}/>
 <Route path="/nghien-cuu" element={account ? <SurveyAdminPage key={account.id} account={account}/> : <Gate />}/>
 <Route path="/quan-tri" element={management ? <section className="legacy-wrapper">{legacy(account.role === 'Quản trị viên cấp cao' ? 'superadmin' : 'admin')}</section> : account?.role === 'Giáo viên' ? <section className="legacy-wrapper">{legacy('teacher-class')}</section> : <Gate />}/>
 <Route path="/quan-tri/:view" element={<ManagementRoute account={account} render={legacy}/>}/>
 <Route path="*" element={<div className="page-wrap"><section className="surface-card"><h1>{ui("Không tìm thấy trang")}</h1><Link to="/">{ui("Về trang chủ")}</Link></section></div>}/>
 </Routes></Suspense></main>
 <footer className="site-footer"><span className="font-brand">{ui("Trạm An · Lặng để lắng · v")}{' '}{APP_RELEASE.version}</span><span>{ui("Khảo sát tự nguyện · Chỉ mở đợt thật đã được duyệt")}</span><Link to="/lien-he">{ui("Kênh hỗ trợ")}</Link></footer><Suspense fallback={null}><ChatPanel key={account?.id ?? 'guest'}/></Suspense>
 </div></PreferencesProvider>;
}
function Loading() {useLocale(); return <div className="page-wrap"><div className="surface-card" role="status">{ui("Đang mở một góc bình yên…")}</div></div>; }
function Gate() {useLocale(); return <div className="page-wrap"><section className="surface-card"><Lock /><h1>{ui("Khu vực cần tài khoản và quyền phù hợp")}</h1><p>{ui("Khảo sát theo mã đợt không bắt đăng nhập. Bài tự đánh giá cũ và khu vực quản trị dùng tài khoản riêng.")}</p><Link className="primary-button" to="/dang-nhap">{ui("Đăng nhập")}</Link><Link className="secondary-button" to="/khao-sat">{ui("Khảo sát ẩn danh")}</Link></section></div>; }
function ManagementRoute({ account, render }: {
    account: AuthAccount | null;
    render: (view: string) => React.ReactNode;
}) {useLocale(); const { view } = useParamsSafe(); const valid = ['admin', 'superadmin', 'admin-list', 'school-list', 'class-list', 'teacher-list', 'reports', 'test-list', 'settings']; if (!account || !(['Admin', 'Quản trị viên cấp cao'].includes(account.role)||account.role==='Giáo viên'&&view==='reports') || !valid.includes(view) || account.role === 'Admin' && ['superadmin', 'admin-list', 'school-list'].includes(view))
    return <Gate />; return <section className="legacy-wrapper">{render(view)}</section>; }
// Route segment is limited to the explicit management registry above.
function useParamsSafe() { const location = useLocation(); return { view: location.pathname.split('/').at(-1) ?? '' }; }
export default function App() {useLocale(); return <HashRouter><AppShell /></HashRouter>; }
