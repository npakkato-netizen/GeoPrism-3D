import React, { useState } from 'react';
import { 
  BarChart3, 
  Target, 
  Award, 
  Flame, 
  Coins, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Sparkles,
  Zap,
  UploadCloud,
  Check,
  Loader2
} from 'lucide-react';
import { QuestionCategory, UserProgress, StudentProfile } from '../../types';
import { syncToGoogleSheet } from '../../utils/googleScript';
import { soundFx } from '../../utils/audio';

interface AnalyticsDashboardProps {
  progress: UserProgress;
  onNavigateToPractice: () => void;
  onNavigateTo3D: () => void;
  studentProfile?: StudentProfile | null;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  progress,
  onNavigateToPractice,
  onNavigateTo3D,
  studentProfile,
}) => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSyncToGoogleSheet = async () => {
    setIsSyncing(true);
    soundFx.playClick();
    try {
      await syncToGoogleSheet({
        studentName: studentProfile?.studentName || '',
        studentClass: studentProfile?.studentClass || '',
        studentNumber: studentProfile?.studentNumber || '',
        studentId: studentProfile?.studentId || '',
        eventType: 'อัปเดตสถิติคะแนนสะสม',
        score: `${progress.totalCorrect}/${progress.totalAnswered}`,
        accuracy: overallAccuracy,
        coins: progress.coins,
        details: `สตรีคสูงสุด ${progress.maxStreak}, หัวข้อที่ทำ ${progress.completedQuestionIds.length} ข้อ, เหรียญรางวัล ${progress.unlockedAchievements.length} ตรา`,
      });
      soundFx.playCorrect();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const overallAccuracy =
    progress.totalAnswered > 0
      ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
      : 0;

  const categoryLabels: Record<QuestionCategory, string> = {
    prism_surface: 'พื้นที่ผิวปริซึม',
    prism_volume: 'ปริมาตรปริซึม',
    cylinder_surface: 'พื้นที่ผิวทรงกระบอก',
    cylinder_volume: 'ปริมาตรทรงกระบอก',
    cross_section: 'การตัดขวาง 3 มิติ',
    applied_realworld: 'โจทย์ประยุกต์ชีวิตจริง',
  };

  // Find lowest and highest performing categories
  const categoryStatsList = (Object.keys(progress.categoryStats) as QuestionCategory[]).map(
    (cat) => {
      const stats = progress.categoryStats[cat];
      const acc = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;
      return {
        key: cat,
        label: categoryLabels[cat],
        answered: stats.answered,
        correct: stats.correct,
        accuracy: acc,
      };
    }
  );

  const practicedCategories = categoryStatsList.filter((c) => c.answered >= 1);
  const weakest = practicedCategories.length > 0
    ? [...practicedCategories].sort((a, b) => a.accuracy - b.accuracy)[0]
    : null;
  const strongest = practicedCategories.length > 0
    ? [...practicedCategories].sort((a, b) => b.accuracy - a.accuracy)[0]
    : null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <BarChart3 className="w-3.5 h-3.5" />
            ระบบสรุปผลคะแนนและวิเคราะห์ทักษะ
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">
            {studentProfile 
              ? `รายงานสรุปผลการเรียนรู้ของ ${studentProfile.studentName || `${studentProfile.firstName || ''} ${studentProfile.lastName || ''}`.trim()}${studentProfile.studentClass ? ` (ชั้น ${studentProfile.studentClass} เลขที่ ${studentProfile.studentNumber})` : ''}`
              : 'กราฟสรุปพัฒนาการและความแม่นยำของผู้เรียน'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            วิเคราะห์ความเข้าใจแยกตามเนื้อหา เพื่อช่วยให้คุณรู้จุดแข็งและจุดที่ต้องฝึกฝนเพิ่มเติม
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            id="btn-sync-analytics-sheet"
            onClick={handleSyncToGoogleSheet}
            disabled={isSyncing}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs active:scale-95 border ${
              syncStatus === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : syncStatus === 'error'
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
            }`}
            title="ส่งผลคะแนนล่าสุดเข้าฐานข้อมูล Google Sheet"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังส่งข้อมูล...</span>
              </>
            ) : syncStatus === 'success' ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>บันทึกคะแนนเข้าชีทสำเร็จ!</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>ส่งผลคะแนนเข้า Google Sheet</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="text-right">
              <div className="text-xs text-slate-500">เหรียญสะสม</div>
              <div className="text-xl font-bold text-amber-600 flex items-center gap-1">
                <Coins className="w-4 h-4 fill-amber-500 text-amber-600" />
                {progress.coins}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">ความแม่นยำรวม</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {overallAccuracy}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            ถูก {progress.totalCorrect} จาก {progress.totalAnswered} ข้อ
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">สตรีคสูงสุด</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 font-mono">
            {progress.maxStreak} <span className="text-sm font-normal text-slate-500">ข้อ</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            สตรีคปัจจุบัน: {progress.streak} ข้อติด
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">แบบฝึกหัดที่ทำสำเร็จ</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {progress.completedQuestionIds.length} <span className="text-sm font-normal text-slate-500">ข้อ</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            จากทั้งหมดในคลังโจทย์
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">รูปทรงที่สำรวจใน 3D</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-purple-600 font-mono">
            {progress.exploredShapes.length} <span className="text-sm font-normal text-slate-500">/ 6</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            การทดลองตัดขวาง
          </div>
        </div>
      </div>

      {/* Graphical Category Mastery Charts */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              ความแม่นยำรายหมวดหมู่ (Topic Mastery Chart)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              แผนภูมิแท่งแสดงสัดส่วนคำตอบที่ถูกต้องในแต่ละหัวข้อ
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {categoryStatsList.map((cat) => {
            const hasData = cat.answered > 0;
            return (
              <div key={cat.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-800 font-semibold">{cat.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">
                      ทำแล้ว {cat.answered} ข้อ (ถูก {cat.correct})
                    </span>
                    <span className="font-bold text-slate-900 font-mono min-w-[40px] text-right">
                      {hasData ? `${cat.accuracy}%` : '-'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      !hasData
                        ? 'bg-slate-200'
                        : cat.accuracy >= 80
                        ? 'bg-emerald-500'
                        : cat.accuracy >= 50
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: hasData ? `${Math.max(5, cat.accuracy)}%` : '0%' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strength & Focus */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>จุดเด่นของคุณ</span>
          </div>
          {strongest && strongest.answered > 0 ? (
            <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-100 text-xs text-emerald-900 space-y-1">
              <div className="font-semibold text-emerald-950">
                คุณทำได้ดีมากในหมวด "{strongest.label}" ({strongest.accuracy}%)
              </div>
              <p className="text-emerald-800">
                มีความเข้าใจสูตรและการประยุกต์ใช้ในระดับดีเยี่ยม พร้อมก้าวสู่โจทย์ระดับยากขึ้น!
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              เริ่มทำแบบฝึกหัดเพื่อวิเคราะห์จุดเด่นของตนเอง
            </p>
          )}
        </div>

        {/* Needs Practice */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>จุดที่แนะนำให้ทบทวนเพิ่มเติม</span>
          </div>
          {weakest && weakest.accuracy < 80 ? (
            <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-100 text-xs text-amber-900 space-y-2">
              <div className="font-semibold text-amber-950">
                ควรฝึกฝนเพิ่มในหมวด "{weakest.label}" ({weakest.accuracy}%)
              </div>
              <p className="text-amber-800">
                ลองเข้าไปที่ห้องแล็บ 3 มิติ เพื่อดูการตัดขวางและคลี่รูปทรง จะช่วยให้เห็นที่มาของสูตรได้ชัดเจนยิ่งขึ้น
              </p>
              <button
                onClick={onNavigateTo3D}
                className="text-xs font-bold text-amber-900 underline hover:text-amber-950"
              >
                ไปที่ห้องปฏิบัติการ 3D &rarr;
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              ยอดเยี่ยม! สถิติความแม่นยำของคุณสูงในทุกหมวดหมู่
            </p>
          )}
        </div>
      </div>

      {/* Speed Test History Log */}
      {progress.speedTestHistory.length > 0 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900">
              ประวัติการทดสอบความเร็ว (Speed Test History)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-medium">
                  <th className="py-2.5 px-3">วันที่</th>
                  <th className="py-2.5 px-3">คะแนน</th>
                  <th className="py-2.5 px-3">ตอบถูก</th>
                  <th className="py-2.5 px-3">ความแม่นยำ</th>
                  <th className="py-2.5 px-3">สตรีคสูงสุด</th>
                  <th className="py-2.5 px-3">เวลาเฉลี่ย/ข้อ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {progress.speedTestHistory.slice(-5).reverse().map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{st.date}</td>
                    <td className="py-2.5 px-3 font-bold text-indigo-600 font-mono text-sm">
                      {st.score}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {st.correctCount} / {st.totalQuestions}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-full ${
                          st.accuracy >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {st.accuracy}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-semibold">
                      {st.maxStreak} ข้อ
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {st.averageTimePerQuestion}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
