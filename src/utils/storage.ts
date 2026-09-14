import confetti from 'canvas-confetti';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';
import { Achievement, QuestionCategory, ShapeType, SpeedTestScore, UserProgress, StudentProfile } from '../types';
import { soundFx } from './audio';

const STORAGE_KEY = 'geoprism_user_progress_v1';
const STUDENT_KEY = 'geoprism_student_profile_v1';

export function loadStudentProfile(): StudentProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STUDENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStudentProfile(profile: StudentProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STUDENT_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function removeStudentProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STUDENT_KEY);
  } catch {
    // ignore
  }
}

export function getInitialProgress(): UserProgress {
  return {
    totalAnswered: 0,
    totalCorrect: 0,
    coins: 50, // Starting welcome bonus
    streak: 0,
    maxStreak: 0,
    categoryStats: {
      prism_surface: { answered: 0, correct: 0 },
      prism_volume: { answered: 0, correct: 0 },
      cylinder_surface: { answered: 0, correct: 0 },
      cylinder_volume: { answered: 0, correct: 0 },
      cross_section: { answered: 0, correct: 0 },
      applied_realworld: { answered: 0, correct: 0 },
    },
    completedQuestionIds: [],
    exploredShapes: [],
    speedTestHistory: [],
    unlockedAchievements: [],
    soundEnabled: true,
  };
}

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return getInitialProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialProgress();
    const parsed = JSON.parse(raw);
    return {
      ...getInitialProgress(),
      ...parsed,
      categoryStats: {
        ...getInitialProgress().categoryStats,
        ...(parsed.categoryStats || {}),
      },
    };
  } catch {
    return getInitialProgress();
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // LocalStorage full or disabled
  }
}

export function triggerConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
    });
  } catch {
    // ignore
  }
}

export interface CheckAchievementResult {
  updatedProgress: UserProgress;
  newlyUnlocked: Achievement[];
}

export function evaluateAchievements(progress: UserProgress): CheckAchievementResult {
  const newlyUnlocked: Achievement[] = [];
  const updatedProgress = { ...progress };

  // Calculate stats
  const prismCorrect =
    progress.categoryStats.prism_surface.correct + progress.categoryStats.prism_volume.correct;
  const cylinderCorrect =
    progress.categoryStats.cylinder_surface.correct + progress.categoryStats.cylinder_volume.correct;
  const realworldCorrect = progress.categoryStats.applied_realworld.correct;
  const bestSpeedScore = progress.speedTestHistory.reduce(
    (max, item) => Math.max(max, item.score),
    0
  );

  INITIAL_ACHIEVEMENTS.forEach((ach) => {
    if (updatedProgress.unlockedAchievements.includes(ach.id)) return;

    let currentVal = 0;
    switch (ach.id) {
      case 'first_step':
        currentVal = updatedProgress.totalCorrect;
        break;
      case 'prism_apprentice':
        currentVal = prismCorrect;
        break;
      case 'cylinder_master':
        currentVal = cylinderCorrect;
        break;
      case 'realworld_engineer':
        currentVal = realworldCorrect;
        break;
      case 'speed_demon':
      case 'speed_legend':
        currentVal = bestSpeedScore;
        break;
      case 'streak_five':
      case 'streak_ten':
        currentVal = updatedProgress.maxStreak;
        break;
      case 'explorer_3d':
        currentVal = updatedProgress.exploredShapes.length;
        break;
      case 'coin_collector':
        currentVal = updatedProgress.coins;
        break;
      case 'grandmaster':
        currentVal = updatedProgress.unlockedAchievements.length;
        break;
      default:
        break;
    }

    if (currentVal >= ach.targetValue) {
      updatedProgress.unlockedAchievements.push(ach.id);
      // Give bonus coins for achievement
      const bonusCoins = ach.tier === 'platinum' ? 100 : ach.tier === 'gold' ? 50 : ach.tier === 'silver' ? 30 : 15;
      updatedProgress.coins += bonusCoins;
      newlyUnlocked.push({
        ...ach,
        currentValue: currentVal,
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
      });
    }
  });

  if (newlyUnlocked.length > 0) {
    saveProgress(updatedProgress);
    triggerConfetti();
    soundFx.playBadgeUnlock();
  }

  return { updatedProgress, newlyUnlocked };
}
