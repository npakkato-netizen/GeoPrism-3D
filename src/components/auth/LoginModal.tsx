import React, { useState, useEffect } from 'react';
import { 
  User, 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  X,
  Loader2,
  BookOpen,
  Hash,
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  LogOut
} from 'lucide-react';
import { StudentProfile } from '../../types';
import { soundFx } from '../../utils/audio';
import { GOOGLE_SCRIPT_URL, RECOMMENDED_GAS_SCRIPT, syncToGoogleSheet } from '../../utils/googleScript';

interface LoginModalProps {
  isOpen: boolean;
  currentProfile: StudentProfile | null;
  onLoginSuccess: (profile: StudentProfile) => void;
  onClose?: () => void;
  onLogout?: () => void;
  isInitialLogin: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  currentProfile,
  onLoginSuccess,
  onClose,
  onLogout,
  isInitialLogin,
}) => {
  const [studentName, setStudentName] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('');
  const [studentNumber, setStudentNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showGasGuide, setShowGasGuide] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(RECOMMENDED_GAS_SCRIPT);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  useEffect(() => {
    if (currentProfile) {
      setStudentName(
        currentProfile.studentName || 
        (currentProfile.firstName ? `${currentProfile.firstName} ${currentProfile.lastName || ''}`.trim() : '')
      );
      setStudentClass(currentProfile.studentClass || '');
      setStudentNumber(currentProfile.studentNumber || '');
    } else {
      setStudentName('');
      setStudentClass('');
      setStudentNumber('');
    }
    setErrorMsg('');
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = studentName.trim();
    const trimmedClass = studentClass.trim();
    const trimmedNumber = studentNumber.trim();

    if (!trimmedName) {
      setErrorMsg('กรุณากรอกชื่อ-นามสกุลของคุณ');
      return;
    }

    if (!trimmedClass) {
      setErrorMsg('กรุณากรอกชั้นเรียน เช่น ม.2/1 หรือ ม.3/2');
      return;
    }

    if (!trimmedNumber) {
      setErrorMsg('กรุณากรอกเลขที่ของคุณ');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    soundFx.playClick();

    const timestamp = new Date().toLocaleString('th-TH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });

    const nameParts = trimmedName.split(/\s+/);
    const firstName = nameParts[0] || trimmedName;
    const lastName = nameParts.slice(1).join(' ') || '';

    const profileData: StudentProfile = {
      studentName: trimmedName,
      firstName: firstName,
      lastName: lastName,
      studentClass: trimmedClass,
      studentNumber: trimmedNumber,
      studentId: `${trimmedClass} เลขที่ ${trimmedNumber}`,
      loginTimestamp: timestamp,
    };

    const payload = {
      studentName: trimmedName,
      name: trimmedName,
      fullName: trimmedName,
      firstName: firstName,
      lastName: lastName,
      studentClass: trimmedClass,
      class: trimmedClass,
      studentNumber: trimmedNumber,
      number: trimmedNumber,
      studentId: `${trimmedClass} เลขที่ ${trimmedNumber}`,
      timestamp: timestamp,
      isoTimestamp: new Date().toISOString(),
      eventType: 'student_login',
    };

    try {
      await syncToGoogleSheet(payload);
    } catch (err) {
      console.warn('Data sync to Google Apps Script encountered an issue:', err);
    } finally {
      setIsSubmitting(false);
      soundFx.playCorrect();
      onLoginSuccess(profileData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button only available if NOT initial compulsory login */}
        {!isInitialLogin && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Decorative Top Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-sky-600 p-6 text-white text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
            <GraduationCap className="w-9 h-9 text-sky-200" />
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur text-indigo-50 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            ระบบลงชื่อเข้าเรียน KruNiracha GeoPrism 3D
          </span>

          <h3 className="text-xl font-bold tracking-tight">
            {isInitialLogin ? 'ห้องเรียนคณิตศาสตร์ KruNiracha' : 'แก้ไขข้อมูลนักเรียน'}
          </h3>
          <p className="text-xs text-sky-100 mt-1 max-w-xs mx-auto">
            กรุณาระบุชื่อ-นามสกุล ชั้น และเลขที่เพื่อบันทึกสถิติการเรียนรู้
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ชื่อ-นามสกุล (ช่องเดียวกัน) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              ชื่อ-นามสกุล <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="input-student-name"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="เช่น เด็กชายสมชาย ใจดี หรือ กานดา สดใส"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium transition-all"
            />
          </div>

          {/* ชั้น & เลขที่ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Class / Grade */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                ชั้น <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="input-student-class"
                required
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="เช่น ม.2/1 หรือ ม.3/2"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium transition-all"
              />
            </div>

            {/* Student Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-600" />
                เลขที่ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="input-student-number"
                required
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="เช่น 1, 15 หรือ 28"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-2.5">
            {!isInitialLogin && onLogout && (
              <button
                type="button"
                id="btn-modal-logout"
                onClick={() => {
                  soundFx.playClick();
                  onLogout();
                }}
                className="py-3 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
                title="ออกจากระบบ เพื่อลงชื่อเข้าใช้ใหม่"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>ออกจากระบบ</span>
              </button>
            )}

            <button
              type="submit"
              id="btn-login-submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-bold text-sm shadow-md hover:from-indigo-700 hover:to-sky-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                <>
                  <span>{isInitialLogin ? 'เข้าสู่บทเรียน' : 'บันทึกการเปลี่ยนแปลง'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              เชื่อมต่อ Google Apps Script และบันทึกข้อมูลอัตโนมัติ
            </span>
          </div>

          {/* Teacher Google Sheet Connection Status & Code */}
          <div className="pt-2 border-t border-slate-100 mt-2">
            <button
              type="button"
              id="btn-toggle-gas-guide"
              onClick={() => setShowGasGuide(!showGasGuide)}
              className="w-full text-center text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center gap-1 py-1 transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
              <span>สำหรับครูผู้สอน: ข้อมูลเชื่อมต่อ Google Sheet</span>
              {showGasGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showGasGuide && (
              <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2.5 animate-fade-in text-left">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    URL Web App ที่เชื่อมต่อ:
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    เชื่อมต่อแล้ว
                  </span>
                </div>

                <div className="p-2 bg-white rounded-lg border border-slate-200 text-[10px] font-mono text-slate-600 break-all select-all">
                  {GOOGLE_SCRIPT_URL}
                </div>

                <div className="space-y-1 text-slate-600 text-[11px] leading-relaxed">
                  <p className="font-semibold text-slate-700">📌 วิธีติดตั้งใน Google Sheet เพื่อรับข้อมูลนักเรียน:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-500 pl-1">
                    <li>เปิด Google Sheet &rarr; ไปที่เมนู <strong>ส่วนขยาย (Extensions)</strong> &rarr; <strong>Apps Script</strong></li>
                    <li>วางโค้ดด้านล่างลงในไฟล์ <code>Code.gs</code> แล้วกดบันทึก (Ctrl+S)</li>
                    <li>กด <strong>การทำให้ใช้งานได้ (Deploy)</strong> &rarr; <strong>การทำให้ใช้งานได้ใหม่</strong> &rarr; เลือก <strong>เว็บแอป</strong> &rarr; สิทธิ์การเข้าถึงเลือก <strong>ทุกคน (Anyone)</strong></li>
                  </ol>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    id="btn-copy-gas-code"
                    onClick={handleCopyCode}
                    className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>คัดลอกโค้ด Apps Script สำเร็จ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอกโค้ด Apps Script (Code.gs)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
