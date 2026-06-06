import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react';
import HandbookMarkdown from './HandbookMarkdown';
import MentalBatteryCheck from './MentalBatteryCheck';

type HandbookSectionLite = {
  id: string;
  category: string;
  title: string;
  content: string;
};

type HandbookContentProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSidebar: () => void;
  activeSection: HandbookSectionLite;
  sections: HandbookSectionLite[];
  activeSectionId: string;
  onActiveSectionChange: (id: string) => void;
  isLoggedIn: boolean;
  userRole?: string;
  onNavigateToTestList: () => void;
  onNavigateToAuth: () => void;
};

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isMentalBatterySection(section: HandbookSectionLite) {
  const searchable = normalizeText(`${section.id} ${section.title} ${section.category} ${section.content.slice(0, 800)}`);
  return [
    'kiet suc',
    'cang thang',
    'stress',
    'met moi',
    'dau hieu',
    'nhan dien',
    'may den',
    'ap luc',
  ].some((keyword) => searchable.includes(keyword));
}

export default function HandbookContent({
  isSidebarOpen,
  onToggleSidebar,
  onOpenSidebar,
  activeSection,
  sections,
  activeSectionId,
  onActiveSectionChange,
  isLoggedIn,
  userRole,
  onNavigateToTestList,
  onNavigateToAuth,
}: HandbookContentProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const throttleRef = useRef<number | null>(null);

  const mentalBatterySectionId = useMemo(() => {
    return sections.find(isMentalBatterySection)?.id || sections[0]?.id || '';
  }, [sections]);

  const updateActiveSectionFromScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const anchorY = containerRect.top + 170;
    const sectionElements = Array.from(container.querySelectorAll<HTMLElement>('[data-handbook-section-id]'));
    if (sectionElements.length === 0) return;

    const currentSection = sectionElements.find((element) => {
      const rect = element.getBoundingClientRect();
      return rect.top <= anchorY && rect.bottom > anchorY;
    }) || sectionElements.reduce((nearest, element) => {
      const nearestDistance = Math.abs(nearest.getBoundingClientRect().top - anchorY);
      const elementDistance = Math.abs(element.getBoundingClientRect().top - anchorY);
      return elementDistance < nearestDistance ? element : nearest;
    }, sectionElements[0]);

    const nextId = currentSection.dataset.handbookSectionId;
    if (nextId && nextId !== activeSectionId) {
      onActiveSectionChange(nextId);
    }
  }, [activeSectionId, onActiveSectionChange]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (throttleRef.current !== null) return;
      throttleRef.current = window.setTimeout(() => {
        throttleRef.current = null;
        updateActiveSectionFromScroll();
      }, 80);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    updateActiveSectionFromScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (throttleRef.current !== null) {
        window.clearTimeout(throttleRef.current);
        throttleRef.current = null;
      }
    };
  }, [updateActiveSectionFromScroll, sections]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      <div className="h-14 border-b border-gray-100 flex items-center px-8">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-50 rounded-xl mr-6 transition-colors"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 hover:bg-gray-50 rounded-xl mr-2 transition-colors"
        >
          <ArrowRight size={20} className="rotate-180" />
        </button>
        <div className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
          <span>{activeSection.category}</span>
          <ChevronRight size={12} />
          <span className="text-brand-primary">{activeSection.title}</span>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth p-8 md:p-16 lg:p-20">
        <div className="max-w-3xl mx-auto space-y-20">
          {sections.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-gray-400">Không tìm thấy nội dung phù hợp</p>
              <p className="mt-3 text-gray-500">Thử đổi từ khóa tìm kiếm hoặc chọn một chủ đề khác trong cẩm nang.</p>
            </div>
          ) : (
            sections.map((section) => (
              <article
                key={section.id}
                id={`handbook-section-${section.id}`}
                data-handbook-section-id={section.id}
                className="scroll-mt-10"
              >
                <div className="mb-12">
                  <span className="text-brand-primary/60 font-black text-[11px] uppercase tracking-[0.3em] mb-4 block">
                    {section.category}
                  </span>
                  <h2 className="text-4xl md:text-5xl font-serif italic text-brand-primary leading-tight">
                    {section.title}
                  </h2>
                  <div className="h-1.5 w-24 bg-brand-orange rounded-full mt-8" />
                </div>
                <div className="markdown-body prose prose-teal lg:prose-lg">
                  <HandbookMarkdown content={section.content} />
                </div>
                {section.id === mentalBatterySectionId && (
                  <MentalBatteryCheck
                    isLoggedIn={isLoggedIn}
                    userRole={userRole}
                    onNavigateToTestList={onNavigateToTestList}
                    onNavigateToAuth={onNavigateToAuth}
                  />
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
