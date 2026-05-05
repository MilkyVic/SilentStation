import React from 'react';
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react';
import HandbookMarkdown from './HandbookMarkdown';

type HandbookContentProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSidebar: () => void;
  activeSection: {
    category: string;
    title: string;
    content: string;
  };
};

export default function HandbookContent({
  isSidebarOpen,
  onToggleSidebar,
  onOpenSidebar,
  activeSection,
}: HandbookContentProps) {
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

      <div className="flex-1 overflow-y-auto p-12 md:p-20">
        <article className="max-w-3xl mx-auto">
          <div className="mb-12">
            <span className="text-brand-primary/60 font-black text-[11px] uppercase tracking-[0.3em] mb-4 block">
              {activeSection.category}
            </span>
            <h2 className="text-5xl font-serif italic text-brand-primary leading-tight">
              {activeSection.title}
            </h2>
            <div className="h-1.5 w-24 bg-brand-orange rounded-full mt-8" />
          </div>
          <div className="markdown-body prose prose-teal lg:prose-lg">
            <HandbookMarkdown content={activeSection.content} />
          </div>
        </article>
      </div>
    </div>
  );
}
