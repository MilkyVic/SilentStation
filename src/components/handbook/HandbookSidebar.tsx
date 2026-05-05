import React from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';

type HandbookSectionLite = {
  id: string;
  title: string;
  category: string;
  icon?: string;
};

type HandbookSidebarProps = {
  isSidebarOpen: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  categories: string[];
  filteredSections: HandbookSectionLite[];
  activeSectionId: string;
  onSelectSection: (id: string) => void;
  iconMap: Record<string, React.ReactNode>;
};

export default function HandbookSidebar({
  isSidebarOpen,
  searchQuery,
  onSearchQueryChange,
  categories,
  filteredSections,
  activeSectionId,
  onSelectSection,
  iconMap,
}: HandbookSidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 320 : 0, opacity: isSidebarOpen ? 1 : 0 }}
      className={cn(
        'border-r border-gray-100 bg-white flex flex-col z-20 relative overflow-hidden',
        !isSidebarOpen && 'pointer-events-none',
      )}
    >
      <div className="p-8 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/40" size={18} />
          <input
            type="text"
            placeholder="Tìm kiến thức..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary/10 outline-none"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-6 space-y-8">
        {categories.map((category) => {
          const sectionsInCat = filteredSections.filter((section) => section.category === category);
          if (sectionsInCat.length === 0) return null;

          return (
            <div key={category} className="space-y-2">
              <h3 className="px-4 text-[11px] uppercase tracking-[0.2em] text-brand-primary font-black mb-4">
                {category}
              </h3>
              {sectionsInCat.map((section) => (
                <button
                  key={section.id}
                  onClick={() => onSelectSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm transition-all group',
                    activeSectionId === section.id
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                      : 'hover:bg-gray-50 text-gray-600',
                  )}
                >
                  <span
                    className={cn(
                      'transition-colors',
                      activeSectionId === section.id ? 'text-white' : 'text-brand-primary/40 group-hover:text-brand-primary',
                    )}
                  >
                    {iconMap[section.icon || 'Info']}
                  </span>
                  <span className="flex-1 text-left font-bold truncate">{section.title}</span>
                </button>
              ))}
            </div>
          );
        })}
      </nav>
    </motion.aside>
  );
}
