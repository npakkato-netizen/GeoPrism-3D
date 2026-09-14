import React from 'react';
import { 
  Award, 
  Crown, 
  Sparkles, 
  Coins, 
  Lock, 
  CheckCircle2, 
  Box, 
  Cylinder, 
  HardHat, 
  Zap, 
  Flame, 
  TrendingUp, 
  Compass 
} from 'lucide-react';
import { INITIAL_ACHIEVEMENTS } from '../../data/achievements';
import { Achievement, UserProgress } from '../../types';

interface TrophyRoomProps {
  progress: UserProgress;
}

export const TrophyRoom: React.FC<TrophyRoomProps> = ({ progress }) => {
  // Map icons
  const renderIcon = (iconName: string, tier: string, unlocked: boolean) => {
    const className = `w-7 h-7 ${
      !unlocked
        ? 'text-slate-400'
        : tier === 'platinum'
        ? 'text-purple-600'
        : tier === 'gold'
        ? 'text-amber-500'
        : tier === 'silver'
        ? 'text-slate-500'
        : 'text-amber-700'
    }`;

    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Box':
        return <Box className={className} />;
      case 'Cylinder':
        return <Cylinder className={className} />;
      case 'HardHat':
        return <HardHat className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'TrendingUp':
        return <TrendingUp className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      case 'Coins':
        return <Coins className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return { label: 'เหรียญแพลทินัม', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'gold':
        return { label: 'เหรียญทองคำ', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'silver':
        return { label: 'เหรียญเงิน', bg: 'bg-slate-200 text-slate-800 border-slate-300' };
      case 'bronze':
      default:
        return { label: 'เหรียญทองแดง', bg: 'bg-orange-100 text-orange-800 border-orange-200' };
    }
  };

  const unlockedCount = progress.unlockedAchievements.length;
  const totalAchievements = INITIAL_ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalAchievements) * 100);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur">
              <Award className="w-3.5 h-3.5" />
              ห้องเกียรติยศและเหรียญรางวัล
            </span>
            <h2 className="text-2xl md:text-3xl font-black">
              ตู้สะสมเหรียญรางวัล (Trophy Showcase)
            </h2>
            <p className="text-amber-100 text-xs md:text-sm max-w-xl">
              ทำแบบฝึกหัด ท้าทายสปีดเทสต์ และสำรวจภาพ 3 มิติ เพื่อปลดล็อกเหรียญตราเกียรติยศและรับเหรียญทองคำโบนัส!
            </p>
          </div>

          {/* Progress Circle & Coins */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-4 shrink-0">
            <div className="text-center">
              <div className="text-3xl font-black text-white font-mono">
                {unlockedCount} / {totalAchievements}
              </div>
              <div className="text-[11px] text-amber-100 mt-0.5">เหรียญที่ปลดล็อก</div>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-300 font-mono flex items-center justify-center gap-1">
                <Coins className="w-5 h-5 fill-yellow-300 text-yellow-500" />
                {progress.coins}
              </div>
              <div className="text-[11px] text-amber-100 mt-0.5">เหรียญทองสะสม</div>
            </div>
          </div>
        </div>

        {/* Overall Completion Bar */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="flex justify-between text-xs text-amber-100 font-medium mb-1.5">
            <span>ความก้าวหน้าในการสะสมเหรียญรางวัล</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Medals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INITIAL_ACHIEVEMENTS.map((ach) => {
          const isUnlocked = progress.unlockedAchievements.includes(ach.id);
          const tierInfo = getTierBadge(ach.tier);

          return (
            <div
              key={ach.id}
              className={`rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-white border-amber-200 shadow-sm hover:shadow-md'
                  : 'bg-slate-50/80 border-slate-200/80 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isUnlocked
                        ? ach.tier === 'gold'
                          ? 'bg-amber-50 border-amber-300 shadow-xs'
                          : ach.tier === 'platinum'
                          ? 'bg-purple-50 border-purple-300 shadow-xs'
                          : 'bg-slate-100 border-slate-300'
                        : 'bg-slate-200 border-slate-300'
                    }`}
                  >
                    {renderIcon(ach.icon, ach.tier, isUnlocked)}
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tierInfo.bg}`}
                  >
                    {tierInfo.label}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm md:text-base">
                  {ach.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {ach.description}
                </p>
              </div>

              {/* Footer status */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {isUnlocked ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> ปลดล็อกสำเร็จแล้ว!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <Lock className="w-3.5 h-3.5" /> ยังไม่ปลดล็อก
                  </span>
                )}

                <span className="font-mono text-amber-600 font-semibold flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  +{ach.tier === 'platinum' ? 100 : ach.tier === 'gold' ? 50 : ach.tier === 'silver' ? 30 : 15}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
