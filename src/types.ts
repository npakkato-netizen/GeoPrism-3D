export type ShapeType = 
  | 'rectangular_prism' 
  | 'triangular_prism' 
  | 'trapezoidal_prism' 
  | 'hexagonal_prism' 
  | 'solid_cylinder' 
  | 'hollow_cylinder';

export type QuestionCategory = 
  | 'prism_surface'
  | 'prism_volume'
  | 'cylinder_surface'
  | 'cylinder_volume'
  | 'cross_section'
  | 'applied_realworld';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface SolutionStep {
  stepNumber: number;
  title: string;
  formula?: string;
  calculation: string;
  explanation: string;
}

export interface Question {
  id: string;
  title: string;
  questionText: string;
  shapeType: ShapeType;
  category: QuestionCategory;
  difficulty: DifficultyLevel;
  options: string[];
  correctIndex: number;
  unit: string;
  diagramInfo?: {
    dimensions: Record<string, number | string>;
    shapeName: string;
  };
  hint: string;
  solutionSteps: SolutionStep[];
  realWorldScenario?: string;
  keyTakeaway: string;
}

export interface SpeedTestScore {
  id: string;
  date: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  maxStreak: number;
  accuracy: number;
  averageTimePerQuestion: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'practice' | 'speed' | 'accuracy' | 'exploration';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
  targetValue: number;
  currentValue: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface UserProgress {
  totalAnswered: number;
  totalCorrect: number;
  coins: number;
  streak: number;
  maxStreak: number;
  categoryStats: Record<QuestionCategory, { answered: number; correct: number }>;
  completedQuestionIds: string[];
  exploredShapes: ShapeType[];
  speedTestHistory: SpeedTestScore[];
  unlockedAchievements: string[];
  soundEnabled: boolean;
}

export interface StudentProfile {
  studentName: string;
  studentClass: string;
  studentNumber: string;
  firstName?: string;
  lastName?: string;
  studentId?: string;
  loginTimestamp: string;
}

export type ActiveTab = '3d-lab' | 'practice' | 'speed-test' | 'analytics' | 'trophies' | 'formulas';
