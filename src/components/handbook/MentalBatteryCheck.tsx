import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, Battery, Check, LogIn, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

type MentalBatteryCheckProps = {
  isLoggedIn: boolean;
  userRole?: string;
  onNavigateToTestList: () => void;
  onNavigateToAuth: () => void;
};

const CHECK_ITEMS = [
  'Ngủ đủ giờ nhưng vẫn thấy cơ thể nặng nề khi thức dậy.',
  'Dễ cáu gắt hoặc mất kiên nhẫn vì những chuyện nhỏ.',
  'Không còn hứng thú với việc từng khiến mình vui.',
  'Muốn thu mình lại, ngại giao tiếp hoặc né tránh tin nhắn.',
];

const MANAGEMENT_ROLES = new Set(['Admin', 'Quản trị viên cấp cao']);

export default function MentalBatteryCheck({
  isLoggedIn,
  userRole,
  onNavigateToTestList,
  onNavigateToAuth,
}: MentalBatteryCheckProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const selectedCount = selectedItems.length;
  const batteryPercent = Math.max(10, 100 - selectedCount * 22.5);
  const shouldShowCta = selectedCount >= 2;
  const canGoToTests = isLoggedIn && !MANAGEMENT_ROLES.has(String(userRole || ''));

  const batteryTone = useMemo(() => {
    if (batteryPercent > 75) return { text: 'Pin ổn định', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
    if (batteryPercent > 50) return { text: 'Pin đang giảm', color: 'bg-amber-500', textColor: 'text-amber-600' };
    if (batteryPercent > 25) return { text: 'Pin cần nghỉ', color: 'bg-orange-500', textColor: 'text-orange-600' };
    return { text: 'Pin rất thấp', color: 'bg-red-500', textColor: 'text-red-600' };
  }, [batteryPercent]);

  const toggleItem = (index: number) => {
    setSelectedItems((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index],
    );
  };

  const handleCta = () => {
    if (canGoToTests) {
      onNavigateToTestList();
      return;
    }
    onNavigateToAuth();
  };

  return (
    <section className="my-14 rounded-[2rem] border border-brand-primary/10 bg-gradient-to-br from-brand-primary/5 via-white to-brand-orange/10 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary shadow-sm">
            <Battery size={14} />
            Mini-test Pin tinh thần
          </div>
          <h3 className="text-2xl font-black text-brand-primary">Hôm nay pin cảm xúc của bạn đang ở mức nào?</h3>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-gray-500">
            Tick những dấu hiệu bạn đang gặp. Đây chỉ là kiểm tra định hướng nhanh, không thay thế bài test chính thức.
          </p>
        </div>

        <div className="min-w-[150px] rounded-3xl bg-white p-5 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
            <Zap className={batteryTone.textColor} size={28} />
          </div>
          <p className={cn('text-3xl font-black', batteryTone.textColor)}>{Math.round(batteryPercent)}%</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">{batteryTone.text}</p>
        </div>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-white">
        <motion.div
          className={cn('h-full rounded-full', batteryTone.color)}
          initial={false}
          animate={{ width: `${batteryPercent}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
      </div>

      <div className="mt-6 grid gap-3">
        {CHECK_ITEMS.map((item, index) => {
          const isSelected = selectedItems.includes(index);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggleItem(index)}
              className={cn(
                'flex items-center gap-4 rounded-2xl border p-4 text-left transition-all',
                isSelected
                  ? 'border-brand-primary bg-brand-primary text-white shadow-lg shadow-brand-primary/15'
                  : 'border-gray-100 bg-white text-gray-600 hover:border-brand-primary/30 hover:bg-brand-primary/5',
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border transition-colors',
                  isSelected ? 'border-white/50 bg-white/20' : 'border-gray-200 bg-gray-50',
                )}
              >
                {isSelected && <Check size={15} />}
              </span>
              <span className="text-sm font-bold leading-relaxed">{item}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {shouldShowCta && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="mt-6 rounded-3xl border border-brand-orange/20 bg-white p-5"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="font-black text-brand-primary">Pin đang báo hiệu bạn nên kiểm tra kỹ hơn.</p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-gray-500">
                    Nếu tình trạng này lặp lại nhiều ngày, hãy thử làm một bài test tâm lý hoặc nhắn với Chat Box bé Trạm.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCta}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand-primary/20 transition-transform hover:-translate-y-0.5"
              >
                {canGoToTests ? 'Đến Trạm giải mã' : 'Đăng nhập để làm test'}
                {!canGoToTests && <LogIn size={15} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
