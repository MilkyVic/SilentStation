import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Bot, ClipboardList, Heart, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

type MoodCheckInProps = {
  userId?: string;
  onOpenHandbook: () => void;
  onOpenTests: () => void;
  onOpenChat: () => void;
};

type MoodOption = {
  label: string;
  tone: string;
  needsSupport?: boolean;
};

const MOOD_OPTIONS: MoodOption[] = [
  { label: 'Bình yên', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { label: 'Vui', tone: 'bg-sky-50 text-sky-700 border-sky-100' },
  { label: 'Mệt', tone: 'bg-amber-50 text-amber-700 border-amber-100', needsSupport: true },
  { label: 'Lo lắng', tone: 'bg-orange-50 text-orange-700 border-orange-100', needsSupport: true },
  { label: 'Cần được lắng nghe', tone: 'bg-brand-primary/10 text-brand-primary border-brand-primary/10', needsSupport: true },
];

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function MoodCheckIn({
  userId,
  onOpenHandbook,
  onOpenTests,
  onOpenChat,
}: MoodCheckInProps) {
  const today = useMemo(() => getTodayKey(), []);
  const storageKey = useMemo(() => `tram_an_mood_${userId || 'guest'}_${today}`, [today, userId]);
  const [selectedMood, setSelectedMood] = useState<string>('');

  useEffect(() => {
    try {
      setSelectedMood(localStorage.getItem(storageKey) || '');
    } catch {
      setSelectedMood('');
    }
  }, [storageKey]);

  const selectedOption = MOOD_OPTIONS.find((option) => option.label === selectedMood);

  const handleSelectMood = (mood: string) => {
    setSelectedMood(mood);
    try {
      localStorage.setItem(storageKey, mood);
    } catch {
      // localStorage can fail in restricted browser modes; UI still updates for the current session.
    }
  };

  const handleReset = () => {
    setSelectedMood('');
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore storage failure; this only affects persistence.
    }
  };

  return (
    <div className="absolute -bottom-6 -left-6 w-[min(360px,calc(100vw-3rem))] rounded-3xl border border-gray-100 bg-white p-5 shadow-xl">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
          <Heart size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cảm xúc hôm nay</p>
          <p className="text-sm font-bold text-brand-primary">
            {selectedMood ? `Bạn đã check-in: ${selectedMood}` : 'Bạn cảm thấy thế nào?'}
          </p>
        </div>
        {selectedMood && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-brand-primary"
            title="Chọn lại cảm xúc"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {MOOD_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => handleSelectMood(option.label)}
            className={cn(
              'rounded-2xl border px-3 py-2 text-left text-[11px] font-black transition-all',
              selectedMood === option.label
                ? 'border-brand-primary bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                : option.tone,
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {selectedOption?.needsSupport && (
        <div className="mt-4 rounded-2xl bg-gray-50 p-3">
          <p className="text-xs font-bold leading-relaxed text-gray-500">
            Trạm An gợi ý bạn chọn một bước nhẹ nhàng ngay bây giờ.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onOpenHandbook}
              className="flex flex-col items-center gap-1 rounded-xl bg-white px-2 py-2 text-[10px] font-black text-brand-primary"
            >
              <BookOpen size={15} />
              Cẩm nang
            </button>
            <button
              type="button"
              onClick={onOpenTests}
              className="flex flex-col items-center gap-1 rounded-xl bg-white px-2 py-2 text-[10px] font-black text-brand-primary"
            >
              <ClipboardList size={15} />
              Làm test
            </button>
            <button
              type="button"
              onClick={onOpenChat}
              className="flex flex-col items-center gap-1 rounded-xl bg-white px-2 py-2 text-[10px] font-black text-brand-primary"
            >
              <Bot size={15} />
              Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
