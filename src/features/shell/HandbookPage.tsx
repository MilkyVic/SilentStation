import { useMemo, useState } from 'react';
import HandbookView from '../../components/handbook/HandbookView';
import { HANDBOOK_DATA } from '../../data';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export default function HandbookPage() { const navigate = useNavigate(), [open, setOpen] = useState(false), [search, setSearch] = useState(''), [active, setActive] = useState(HANDBOOK_DATA[0].id); const sections = useMemo(() => HANDBOOK_DATA.filter(s => `${s.title} ${s.category} ${s.content}`.toLowerCase().includes(search.toLowerCase())), [search]); return <div className="handbook-page"><HandbookView isSidebarOpen={open} setIsSidebarOpen={setOpen} searchQuery={search} setSearchQuery={setSearch} categories={[...new Set(HANDBOOK_DATA.map(s => s.category))]} filteredSections={sections} activeSectionId={active} setActiveSectionId={setActive} activeSection={HANDBOOK_DATA.find(s => s.id === active) ?? HANDBOOK_DATA[0]} iconMap={Object.fromEntries(HANDBOOK_DATA.map(s => [s.icon ?? 'Info', <BookOpen size={18}/>]))} isLoggedIn={false} onNavigateToTestList={() => navigate('/bai-danh-gia')} onNavigateToAuth={() => navigate('/dang-nhap')}/></div>; }
