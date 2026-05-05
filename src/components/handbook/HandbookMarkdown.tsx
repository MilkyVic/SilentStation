import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { cn } from '../../lib/utils';

const TooltipWord = ({ word, tooltipText }: { word: React.ReactNode; tooltipText: string }) => {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-block group"
      onClick={(e) => {
        e.preventDefault();
        setShow((prev) => !prev);
      }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="font-black border-b-[3px] border-dotted border-brand-orange text-brand-primary cursor-pointer hover:bg-brand-orange/10 transition-colors px-1 rounded">
        {word}
      </span>
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 bg-white text-gray-800 text-sm rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-brand-orange/20 font-medium leading-relaxed pointer-events-none block"
          >
            {tooltipText}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-[10px] border-transparent border-t-white drop-shadow-sm" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

type HandbookMarkdownProps = {
  content: string;
};

export default function HandbookMarkdown({ content }: HandbookMarkdownProps) {
  const markdownComponents = useMemo(() => ({
    img: ({ src, alt, ...props }: any) => {
      let layoutClass = 'mx-auto w-full block clear-both';
      if (typeof src === 'string') {
        if (src.includes('2.png') || src.includes('5.png') || src.includes('7.png') || src.includes('10.png')) {
          layoutClass = 'md:float-left md:mr-8 md:mb-6 md:max-w-md';
        } else if (src.includes('.png') && !src.includes('Gemini_Generated_Image')) {
          if (!src.includes('1.png') && !src.includes('8.png') && !src.includes('12.png')) {
            layoutClass = 'md:float-right md:ml-8 md:mb-6 md:max-w-md';
          }
        }
      }
      return (
        <img
          src={src}
          alt={alt}
          className={cn('rounded-2xl shadow-md my-12 object-cover border border-gray-100', layoutClass)}
          {...props}
        />
      );
    },
    a: ({ href, children, ...props }: any) => {
      if (typeof href === 'string' && href.startsWith('#tooltip:')) {
        const tooltipText = decodeURIComponent(href.replace('#tooltip:', '')).replace(/_/g, ' ');
        return <TooltipWord word={children} tooltipText={tooltipText} />;
      }

      if (typeof href === 'string' && href.endsWith('.mp4')) {
        return (
          <span className="block my-8 aspect-video w-full md:w-3/4 rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-black mx-auto clear-both">
            <video src={href} controls className="w-full h-full" />
          </span>
        );
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-primary hover:text-brand-orange font-medium underline underline-offset-2"
          {...props}
        >
          {children}
        </a>
      );
    },
    h1: () => null,
    h2: ({ ...props }: any) => <h2 className="text-3xl font-serif text-gray-800 border-b pb-2 mt-12 mb-6" {...props} />,
    h3: ({ ...props }: any) => <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4 border-l-4 border-brand-primary pl-4" {...props} />,
    blockquote: ({ ...props }: any) => <blockquote className="border-l-4 border-brand-orange pl-6 my-6 bg-brand-orange/5 py-4 pr-4 rounded-r-2xl italic text-gray-700" {...props} />,
    details: ({ ...props }: any) => <details className="border border-brand-primary/10 rounded-2xl mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white group" {...props} />,
    summary: ({ ...props }: any) => <summary className="w-full px-6 py-5 flex items-center justify-between font-bold text-brand-primary cursor-pointer list-none [&::-webkit-details-marker]:hidden border-b border-transparent group-open:border-brand-primary/10 group-open:bg-brand-primary/5 transition-colors" {...props} />,
  }), []);

  return (
    <Markdown rehypePlugins={[rehypeRaw]} components={markdownComponents as any}>
      {content}
    </Markdown>
  );
}
