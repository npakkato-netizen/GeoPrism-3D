import React from 'react';
import { 
  Box, 
  BookOpen, 
  Zap, 
  BarChart3, 
  Award, 
  FileText, 
  Volume2, 
  VolumeX, 
  Coins,
  Scissors,
  User,
  LogOut
} from 'lucide-react';
import { ActiveTab, UserProgress, StudentProfile } from '../types';
import { soundFx } from '../utils/audio';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  progress: UserProgress;
  onToggleSound: () => void;
  studentProfile: StudentProfile | null;
  onOpenProfileModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  progress,
  onToggleSound,
  studentProfile,
  onOpenProfileModal,
  onLogout,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: '3d-lab', label: 'ห้องทดลอง 3D & ตัดขวาง', icon: <Box className="w-4 h-4" /> },
    { id: 'practice', label: 'โจทย์ฝึกหัด & วิธีคิด', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'speed-test', label: 'โหมดสปีดเทสต์', icon: <Zap className="w-4 h-4" />, badge: 'ท้าทาย' },
    { id: 'analytics', label: 'สรุปผลกราฟิก', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'trophies', label: 'เหรียญรางวัล', icon: <Award className="w-4 h-4" /> },
    { id: 'formulas', label: 'สรุปสูตร', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('3d-lab')}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-base leading-tight tracking-tight">
                  KruNiracha <span className="text-indigo-600 font-bold">GeoPrism 3D</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Math Lab
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight hidden sm:block">
                สื่อการเรียนรู้คณิตศาสตร์ โดยครูนิรชา (KruNiracha)
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    soundFx.playClick();
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 relative ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="ml-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-white animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Status: Coins, Sound, & Student Profile */}
          <div className="flex items-center gap-2">
            {/* Student Profile Badge & Logout Button */}
            {studentProfile && (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-navbar-student-profile"
                  onClick={onOpenProfileModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-2xl text-xs font-semibold text-indigo-900 transition-colors"
                  title="คลิกเพื่อแก้ไขข้อมูลนักเรียน"
                >
                  <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="max-w-[80px] sm:max-w-[130px] truncate font-bold">
                    {studentProfile.studentName || 
                      `${studentProfile.firstName || ''} ${studentProfile.lastName || ''}`.trim()}
                  </span>
                  {(studentProfile.studentClass || studentProfile.studentId) && (
                    <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-white text-indigo-700 font-mono border border-indigo-200">
                      {studentProfile.studentClass 
                        ? `${studentProfile.studentClass}/${studentProfile.studentNumber}`
                        : studentProfile.studentId}
                    </span>
                  )}
                </button>

                <button
                  id="btn-navbar-logout"
                  onClick={() => {
                    soundFx.playClick();
                    onLogout();
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 rounded-2xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95"
                  title="ออกจากระบบ เพื่อลงชื่อเข้าใช้เป็นนักเรียนคนอื่น"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                </button>
              </div>
            )}

            {/* Coins Counter */}
            <div 
              onClick={() => setActiveTab('trophies')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-2xl cursor-pointer hover:bg-amber-100 transition-colors"
              title="เหรียญทองสะสมของคุณ"
            >
              <Coins className="w-4 h-4 fill-amber-500 text-amber-600" />
              <span className="text-xs font-black text-amber-900 font-mono">
                {progress.coins}
              </span>
            </div>

            {/* Sound Toggle */}
            <button
              id="btn-sound-toggle"
              onClick={onToggleSound}
              className={`p-2 rounded-xl border transition-colors ${
                progress.soundEnabled
                  ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-rose-50 border-rose-200 text-rose-600'
              }`}
              title={progress.soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
            >
              {progress.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Tabs Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-100">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  soundFx.playClick();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
