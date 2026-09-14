import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Edit3, ShieldCheck, ChevronUp, ChevronDown } from 'lucide-react';
import { StudentProfile } from '../../types';
import { soundFx } from '../../utils/audio';

interface StudentCornerButtonProps {
  profile: StudentProfile | null;
  onEditProfile: () => void;
  onLogout: () => void;
}

export const StudentCornerButton: React.FC<StudentCornerButtonProps> = ({
  profile,
  onEditProfile,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!profile) return null;

  const displayName = profile.studentName || (profile.firstName 
    ? `${profile.firstName} ${profile.lastName || ''}`.trim() 
    : 'ผู้เรียน');

  const displayClassAndNumber = profile.studentClass
    ? `ชั้น ${profile.studentClass} เลขที่ ${profile.studentNumber}`
    : profile.studentId || '';

  return (
    <div 
      ref={dropdownRef} 
      className="fixed bottom-5 left-5 z-40 select-none"
    >
      {/* Popover Menu */}
      {isOpen && (
        <div className="mb-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 animate-fade-in space-y-3">
          <div className="flex items-start justify-between pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ข้อมูลผู้เรียนปัจจุบัน</span>
              </div>
              <div className="font-bold text-slate-900 text-sm mt-1">
                {displayName}
              </div>
              {displayClassAndNumber && (
                <div className="text-xs text-indigo-600 font-bold mt-0.5">
                  {displayClassAndNumber}
                </div>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            เข้าสู่ระบบเมื่อ: {profile.loginTimestamp}
          </div>

          <div className="space-y-1.5 pt-1">
            <button
              id="corner-btn-edit-profile"
              onClick={() => {
                setIsOpen(false);
                soundFx.playClick();
                onEditProfile();
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>แก้ไขข้อมูล (ชื่อ-สกุล ชั้น เลขที่)</span>
            </button>

            <button
              id="corner-btn-logout"
              onClick={() => {
                setIsOpen(false);
                soundFx.playClick();
                onLogout();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-100 border border-rose-200/70 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>ออกจากระบบ (เปลี่ยนผู้เรียน)</span>
            </button>
          </div>
        </div>
      )}

      {/* Trigger Button at Screen Corner */}
      <button
        id="student-corner-menu-trigger"
        onClick={() => {
          soundFx.playClick();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3.5 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 text-slate-800 hover:bg-slate-50 hover:border-indigo-300 transition-all group"
        title="คลิกเพื่อจัดการโปรไฟล์นักเรียนหรือออกจากระบบ"
      >
        <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
          <User className="w-4 h-4" />
        </div>

        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors max-w-[130px] truncate">
            {displayName}
          </div>
          {displayClassAndNumber && (
            <div className="text-[10px] text-slate-400 font-mono leading-none">
              {displayClassAndNumber}
            </div>
          )}
        </div>

        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        )}
      </button>
    </div>
  );
};
