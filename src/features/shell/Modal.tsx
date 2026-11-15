import React, { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';
export default function Modal({ title, onClose, children }: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    const titleId = useId();
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => { const previous = document.activeElement as HTMLElement; const oldOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; const first = ref.current?.querySelector<HTMLElement>('button,input,textarea,select,a[href]'); first?.focus(); const key = (event: KeyboardEvent) => { if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
    } if (event.key === 'Tab') {
        const elements = [...ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea,select,a[href],[tabindex="0"]') ?? []].filter(e => e.getClientRects().length);
        const first = elements[0], last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
        }
        else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
        }
    } }; document.addEventListener('keydown', key); return () => { document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', key); previous?.focus(); }; }, [onClose]);
    return <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget)
        onClose(); }}><div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="modal-card"><button className="icon-button modal-close" aria-label="Đóng cửa sổ" onClick={onClose}><X size={20}/></button><h2 id={titleId}>{title}</h2>{children}</div></div>;
}
