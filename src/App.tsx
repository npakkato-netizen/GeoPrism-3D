/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, Question, ShapeType, SpeedTestScore, Achievement, UserProgress, StudentProfile } from './types';
import { 
  loadProgress, 
  saveProgress, 
  evaluateAchievements, 
  loadStudentProfile, 
  saveStudentProfile, 
  removeStudentProfile 
} from './utils/storage';
import { soundFx } from './utils/audio';
import { syncToGoogleSheet } from './utils/googleScript';
import { Navbar } from './components/Navbar';
import { Shape3DViewer } from './components/3d/Shape3DViewer';
import { PracticeMode } from './components/practice/PracticeMode';
import { SpeedTestMode } from './components/speedtest/SpeedTestMode';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { TrophyRoom } from './components/trophies/TrophyRoom';
import { FormulaCheatSheet } from './components/formulas/FormulaCheatSheet';
import { AchievementNotification } from './components/trophies/AchievementNotification';
import { LoginModal } from './components/auth/LoginModal';
import { StudentCornerButton } from './components/auth/StudentCornerButton';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress());
  const [activeTab, setActiveTab] = useState<ActiveTab>('3d-lab');
  const [recentUnlockedAchievement, setRecentUnlockedAchievement] = useState<Achievement | null>(null);

  // Student Profile state
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() => loadStudentProfile());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => loadStudentProfile() === null);

  const handleLoginSuccess = (profile: StudentProfile) => {
    setStudentProfile(profile);
    saveStudentProfile(profile);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    removeStudentProfile();
    setStudentProfile(null);
    setIsLoginModalOpen(true);
  };

  // Sync sound settings
  useEffect(() => {
    soundFx.enabled = progress.soundEnabled;
  }, [progress.soundEnabled]);

  // Handle answering a question in Practice Mode
  const handleAnswerQuestion = (question: Question, isCorrect: boolean) => {
    setProgress((prev) => {
      const currentCatStats = prev.categoryStats[question.category] || { answered: 0, correct: 0 };
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const newMaxStreak = Math.max(prev.maxStreak, newStreak);

      const coinEarned = isCorrect ? 10 + (newStreak >= 3 ? 5 : 0) : 0;

      const completed = isCorrect && !prev.completedQuestionIds.includes(question.id)
        ? [...prev.completedQuestionIds, question.id]
        : prev.completedQuestionIds;

      const updated: UserProgress = {
        ...prev,
        totalAnswered: prev.totalAnswered + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        coins: prev.coins + coinEarned,
        streak: newStreak,
        maxStreak: newMaxStreak,
        completedQuestionIds: completed,
        categoryStats: {
          ...prev.categoryStats,
          [question.category]: {
            answered: currentCatStats.answered + 1,
            correct: currentCatStats.correct + (isCorrect ? 1 : 0),
          },
        },
      };

      const { updatedProgress, newlyUnlocked } = evaluateAchievements(updated);
      saveProgress(updatedProgress);

      if (newlyUnlocked.length > 0) {
        setRecentUnlockedAchievement(newlyUnlocked[0]);
      }

      return updatedProgress;
    });
  };

  // Handle 3D shape exploration
  const handleShapeExplored = (shape: ShapeType) => {
    setProgress((prev) => {
      if (prev.exploredShapes.includes(shape)) return prev;
      const updated: UserProgress = {
        ...prev,
        exploredShapes: [...prev.exploredShapes, shape],
      };
      const { updatedProgress, newlyUnlocked } = evaluateAchievements(updated);
      saveProgress(updatedProgress);
      if (newlyUnlocked.length > 0) {
        setRecentUnlockedAchievement(newlyUnlocked[0]);
      }
      return updatedProgress;
    });
  };

  // Handle completion of Speed Test
  const handleCompleteSpeedTest = (result: SpeedTestScore) => {
    setProgress((prev) => {
      const coinReward = Math.floor(result.score / 15);
      const updated: UserProgress = {
        ...prev,
        coins: prev.coins + coinReward,
        speedTestHistory: [...prev.speedTestHistory, result],
        maxStreak: Math.max(prev.maxStreak, result.maxStreak),
      };
      const { updatedProgress, newlyUnlocked } = evaluateAchievements(updated);
      saveProgress(updatedProgress);
      if (newlyUnlocked.length > 0) {
        setRecentUnlockedAchievement(newlyUnlocked[0]);
      }

      if (studentProfile) {
        syncToGoogleSheet({
          studentName: studentProfile.studentName,
          studentClass: studentProfile.studentClass,
          studentNumber: studentProfile.studentNumber,
          studentId: studentProfile.studentId,
          eventType: 'Speed Test ทดสอบความเร็ว',
          score: result.score,
          accuracy: result.accuracy,
          coins: coinReward,
          details: `ตอบถูก ${result.correctCount}/${result.totalQuestions} ข้อ, สตรีค ${result.maxStreak}`,
        }).catch(() => {});
      }

      return updatedProgress;
    });
  };

  // Toggle audio
  const handleToggleSound = () => {
    setProgress((prev) => {
      const nextVal = !prev.soundEnabled;
      soundFx.enabled = nextVal;
      const updated = { ...prev, soundEnabled: nextVal };
      saveProgress(updated);
      return updated;
    });
  };

  // Compute best speed score
  const bestSpeedScore = progress.speedTestHistory.reduce(
    (max, item) => Math.max(max, item.score),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        progress={progress}
        onToggleSound={handleToggleSound}
        studentProfile={studentProfile}
        onOpenProfileModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {activeTab === '3d-lab' && (
          <Shape3DViewer onShapeExplored={handleShapeExplored} />
        )}

        {activeTab === 'practice' && (
          <PracticeMode
            progress={progress}
            onAnswerQuestion={handleAnswerQuestion}
          />
        )}

        {activeTab === 'speed-test' && (
          <SpeedTestMode
            onCompleteSpeedTest={handleCompleteSpeedTest}
            bestScore={bestSpeedScore}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            progress={progress}
            studentProfile={studentProfile}
            onNavigateToPractice={() => setActiveTab('practice')}
            onNavigateTo3D={() => setActiveTab('3d-lab')}
          />
        )}

        {activeTab === 'trophies' && (
          <TrophyRoom progress={progress} />
        )}

        {activeTab === 'formulas' && (
          <FormulaCheatSheet />
        )}
      </main>

      {/* Achievement Unlocked Toast Notification */}
      <AchievementNotification
        achievement={recentUnlockedAchievement}
        onClose={() => setRecentUnlockedAchievement(null)}
      />

      {/* Floating Student Corner Button (Bottom Left) */}
      <StudentCornerButton
        profile={studentProfile}
        onEditProfile={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Student Login & Profile Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        currentProfile={studentProfile}
        isInitialLogin={studentProfile === null}
        onLoginSuccess={handleLoginSuccess}
        onClose={() => setIsLoginModalOpen(false)}
        onLogout={handleLogout}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">KruNiracha &bull; GeoPrism 3D</span> &copy; 2026 — สื่อการเรียนรู้คณิตศาสตร์เรื่องพื้นที่ผิวและปริมาตร
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('formulas')}
              className="hover:text-indigo-600 transition-colors"
            >
              สรุปสูตรคำนวณ
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setActiveTab('3d-lab')}
              className="hover:text-indigo-600 transition-colors"
            >
              ห้องปฏิบัติการ 3 มิติ
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setActiveTab('trophies')}
              className="hover:text-indigo-600 transition-colors"
            >
              เหรียญรางวัล ({progress.unlockedAchievements.length}/11)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
