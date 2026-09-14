import React, { useEffect } from 'react';
import { Award, X, Sparkles } from 'lucide-react';
import { Achievement } from '../../types';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
}) => {
  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce max-w-sm">
      <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-3xl p-4 shadow-xl border-2 border-yellow-300 flex items-start gap-3 relative">
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <Award className="w-6 h-6 text-yellow-200" />
        </div>

        <div className="pr-4 space-y-0.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-yellow-100 uppercase tracking-wide">
            <Sparkles className="w-3 h-3" />
            ปลดล็อกเหรียญรางวัลใหม่!
          </div>
          <h4 className="font-bold text-sm text-white">
            {achievement.title}
          </h4>
          <p className="text-xs text-yellow-100 leading-snug">
            {achievement.description}
          </p>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
