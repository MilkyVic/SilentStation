import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import HandbookSidebar from './HandbookSidebar';
import HandbookContent from './HandbookContent';

type HandbookSectionLite = {
  id: string;
  title: string;
  category: string;
  icon?: string;
  content: string;
};

type HandbookViewProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (next: boolean) => void;
  searchQuery: string;
  setSearchQuery: (next: string) => void;
  categories: string[];
  filteredSections: HandbookSectionLite[];
  activeSectionId: string;
  setActiveSectionId: (next: string) => void;
  activeSection: HandbookSectionLite;
  iconMap: Record<string, React.ReactNode>;
  isLoggedIn: boolean;
  userRole?: string;
  onNavigateToTestList: () => void;
  onNavigateToAuth: () => void;
};

export default function HandbookView({
  isSidebarOpen,
  setIsSidebarOpen,
  searchQuery,
  setSearchQuery,
  categories,
  filteredSections,
  activeSectionId,
  setActiveSectionId,
  activeSection,
  iconMap,
  isLoggedIn,
  userRole,
  onNavigateToTestList,
  onNavigateToAuth,
}: HandbookViewProps) {
  useEffect(() => {
    if (filteredSections.length === 0) return;
    if (!filteredSections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(filteredSections[0].id);
    }
  }, [activeSectionId, filteredSections, setActiveSectionId]);

  const handleSelectSection = (id: string) => {
    setActiveSectionId(id);
    window.requestAnimationFrame(() => {
      document.getElementById(`handbook-section-${id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  return (
    <motion.div
      key="handbook"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-[calc(100vh-200px)]"
    >
      <HandbookSidebar
        isSidebarOpen={isSidebarOpen}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        categories={categories}
        filteredSections={filteredSections}
        activeSectionId={activeSectionId}
        onSelectSection={handleSelectSection}
        iconMap={iconMap}
      />

      <HandbookContent
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        activeSection={activeSection}
        sections={filteredSections}
        activeSectionId={activeSectionId}
        onActiveSectionChange={setActiveSectionId}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        onNavigateToTestList={onNavigateToTestList}
        onNavigateToAuth={onNavigateToAuth}
      />
    </motion.div>
  );
}
