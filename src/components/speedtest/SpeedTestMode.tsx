import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Zap, 
  Timer, 
  Flame, 
  Trophy, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Award,
  Clock,
  Target
} from 'lucide-react';
import { Question, SpeedTestScore } from '../../types';
import { QUESTIONS_POOL } from '../../data/questions';
import { soundFx } from '../../utils/audio';
import { triggerConfetti } from '../../utils/storage';

interface SpeedTestModeProps {
  onCompleteSpeedTest: (result: SpeedTestScore) => void;
  bestScore: number;
}

export const SpeedTestMode: React.FC<SpeedTestModeProps> = ({
  onCompleteSpeedTest,
  bestScore,
}) => {
  // Game states: 'idle' | 'countdown' | 'playing' | 'ended'
  const [gameState, setGameState] = useState<'idle' | 'countdown' | 'playing' | 'ended'>('idle');
  const [duration, setDuration] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [countdown, setCountdown] = useState<number>(3);
  
  // Scoring
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState<number>(0);

  // Current Question
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [flashFeedback, setFlashFeedback] = useState<'correct' | 'wrong' | null>(null);

  // History of answers during test
  const [historyAnswers, setHistoryAnswers] = useState<
    { question: Question; chosen: number; isCorrect: boolean }[]
  >([]);

  // Start Countdown
  const handleStartGame = (chosenDuration: number) => {
    setDuration(chosenDuration);
    setTimeLeft(chosenDuration);
    setGameState('countdown');
    setCountdown(3);

    // Shuffle pool
    const shuffled = [...QUESTIONS_POOL].sort(() => 0.5 - Math.random());
    setQuestionList(shuffled);
    setQIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setTotalQuestionsAnswered(0);
    setHistoryAnswers([]);
  };

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'countdown') return;
    if (countdown > 0) {
      soundFx.playTick();
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setGameState('playing');
    }
  }, [gameState, countdown]);

  // Main game timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      finishGame();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }
        if (prev <= 5) {
          soundFx.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const finishGame = () => {
    setGameState('ended');
    const accuracy =
      totalQuestionsAnswered > 0 ? (correctCount / totalQuestionsAnswered) * 100 : 0;
    const avgTime =
      totalQuestionsAnswered > 0 ? (duration - timeLeft) / totalQuestionsAnswered : 0;

    const result: SpeedTestScore = {
      id: 'st_' + Date.now(),
      date: new Date().toLocaleDateString('th-TH'),
      score,
      correctCount,
      totalQuestions: totalQuestionsAnswered,
      timeTakenSeconds: duration - Math.max(0, timeLeft),
      maxStreak,
      accuracy: Math.round(accuracy),
      averageTimePerQuestion: Number(avgTime.toFixed(1)),
    };

    onCompleteSpeedTest(result);

    if (score >= 500) {
      triggerConfetti();
      soundFx.playBadgeUnlock();
    }
  };

  const handleAnswer = (optionIdx: number) => {
    if (gameState !== 'playing' || !questionList[qIndex] || flashFeedback) return;
    const currentQ = questionList[qIndex];
    setSelectedOption(optionIdx);

    const isCorrect = optionIdx === currentQ.correctIndex;
    const newTotal = totalQuestionsAnswered + 1;
    setTotalQuestionsAnswered(newTotal);

    setHistoryAnswers((prev) => [
      ...prev,
      { question: currentQ, chosen: optionIdx, isCorrect },
    ]);

    if (isCorrect) {
      soundFx.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((m) => Math.max(m, newStreak));
      setCorrectCount((c) => c + 1);

      // Multiplier based on streak
      const multiplier = newStreak >= 5 ? 3 : newStreak >= 3 ? 2 : 1;
      const basePoints = 100;
      const points = basePoints * multiplier;
      setScore((s) => s + points);

      // +2 bonus seconds
      setTimeLeft((t) => Math.min(t + 2, duration + 10));

      if (newStreak === 3 || newStreak === 5 || newStreak === 10) {
        soundFx.playStreak();
      }
      setFlashFeedback('correct');
    } else {
      soundFx.playWrong();
      setStreak(0);
      setFlashFeedback('wrong');
    }

    setTimeout(() => {
      setFlashFeedback(null);
      setSelectedOption(null);
      if (qIndex + 1 < questionList.length) {
        setQIndex((i) => i + 1);
      } else {
        // reshuffle if reached end
        const reshuffled = [...QUESTIONS_POOL].sort(() => 0.5 - Math.random());
        setQuestionList(reshuffled);
        setQIndex(0);
      }
    }, 450);
  };

  const currentQ = questionList[qIndex];

  // Rank calculation
  const getRank = (finalScore: number) => {
    if (finalScore >= 1200) return { rank: 'S+', color: 'text-amber-500', title: 'อัจฉริยะความเร็วแสง' };
    if (finalScore >= 900) return { rank: 'S', color: 'text-purple-600', title: 'สุดยอดนักคำนวณ' };
    if (finalScore >= 600) return { rank: 'A', color: 'text-indigo-600', title: 'ผู้เชี่ยวชาญเรขาคณิต' };
    if (finalScore >= 300) return { rank: 'B', color: 'text-emerald-600', title: 'ทำได้ดีมาก' };
    return { rank: 'C', color: 'text-slate-600', title: 'ฝึกฝนเพิ่มเติม' };
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 1. Idle Screen */}
      {gameState === 'idle' && (
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
            <Zap className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              โหมดทดสอบความเร็ว (Speed Test Challenge)
            </h2>
            <p className="text-slate-600 mt-2 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              ท้าทายความจำสูตรและความแม่นยำในการคิดคำนวณพื้นที่ผิวและปริมาตรแข่งกับเวลา ยิ่งตอบถูกต่อเนื่อง ยิ่งได้คะแนนคูณมหาศาล!
            </p>
          </div>

          {bestScore > 0 && (
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-2xl text-xs md:text-sm font-semibold">
              <Trophy className="w-4 h-4 text-amber-600" />
              คะแนนสูงสุดของคุณ: <span className="text-amber-700 font-bold">{bestScore} คะแนน</span>
            </div>
          )}

          {/* Duration Selector */}
          <div className="space-y-3 pt-4">
            <span className="text-xs font-bold text-slate-500 block">เลือกระยะเวลาการท้าทาย</span>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <button
                id="speedtest-start-60"
                onClick={() => handleStartGame(60)}
                className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 hover:bg-indigo-600 hover:text-white transition-all group"
              >
                <div className="text-2xl font-bold">60s</div>
                <div className="text-xs mt-1 font-medium opacity-80">สปรินต์เร็ว</div>
              </button>
              <button
                id="speedtest-start-90"
                onClick={() => handleStartGame(90)}
                className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 hover:bg-indigo-600 hover:text-white transition-all group"
              >
                <div className="text-2xl font-bold">90s</div>
                <div className="text-xs mt-1 font-medium opacity-80">มาตรฐาน</div>
              </button>
              <button
                id="speedtest-start-120"
                onClick={() => handleStartGame(120)}
                className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 hover:bg-indigo-600 hover:text-white transition-all group"
              >
                <div className="text-2xl font-bold">120s</div>
                <div className="text-xs mt-1 font-medium opacity-80">มาราธอน</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-4 text-left border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-600">ตอบถูก: +100 แต้ม</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs text-slate-600">ตอบถูกติดกัน: คูณ 2x, 3x</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-xs text-slate-600">ตอบถูก: +2 วินาที</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Countdown Screen */}
      {gameState === 'countdown' && (
        <div className="bg-slate-900 rounded-3xl p-16 text-center text-white space-y-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            เตรียมพร้อม...
          </div>
          <div className="text-8xl font-black text-amber-400 animate-ping">
            {countdown > 0 ? countdown : 'ลุย!'}
          </div>
        </div>
      )}

      {/* 3. Playing Screen */}
      {gameState === 'playing' && currentQ && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
          {/* Top Bar: Timer, Score, Streak Multiplier */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            {/* Timer */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  timeLeft <= 10
                    ? 'bg-rose-100 text-rose-600 animate-pulse'
                    : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">เวลาที่เหลือ</div>
                <div
                  className={`text-xl font-black font-mono ${
                    timeLeft <= 10 ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {timeLeft} <span className="text-xs font-normal">วินาที</span>
                </div>
              </div>
            </div>

            {/* Streak Combo */}
            <div className="flex items-center gap-2">
              {streak >= 2 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-2xl font-bold text-xs shadow-sm animate-bounce">
                  <Flame className="w-4 h-4 fill-white" />
                  <span>คอมโบ x{streak >= 5 ? 3 : 2} ({streak} ข้อติด)</span>
                </div>
              )}
            </div>

            {/* Score */}
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">คะแนนรวม</div>
              <div className="text-2xl font-black text-indigo-600 font-mono">
                {score}
              </div>
            </div>
          </div>

          {/* Time Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                timeLeft <= 10 ? 'bg-rose-500' : timeLeft <= 25 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, (timeLeft / duration) * 100))}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              ข้อที่ {totalQuestionsAnswered + 1}
            </span>
            <h3 className="text-base md:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.questionText}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let btnStyle = 'bg-slate-50 hover:bg-indigo-50/50 border-slate-200 text-slate-800';

              if (flashFeedback === 'correct' && isSelected) {
                btnStyle = 'bg-emerald-500 border-emerald-600 text-white font-bold scale-[1.02] shadow-md';
              } else if (flashFeedback === 'wrong' && isSelected) {
                btnStyle = 'bg-rose-500 border-rose-600 text-white font-bold scale-[0.98]';
              }

              return (
                <button
                  key={idx}
                  id={`speedtest-opt-${idx}`}
                  disabled={flashFeedback !== null}
                  onClick={() => handleAnswer(idx)}
                  className={`p-4 rounded-2xl border-2 text-left font-medium transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-white/40 flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm font-semibold">{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Ended Screen (Rich Graphic Summary) */}
      {gameState === 'ended' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
          {/* Header Trophy Banner */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 text-center space-y-4 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 backdrop-blur">
                สรุปผลการทดสอบความเร็ว
              </span>
              <div className="text-5xl md:text-6xl font-black text-amber-400 font-mono tracking-tight">
                {score} <span className="text-xl font-normal text-slate-300">แต้ม</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold">{getRank(score).title}</span>
                <span className={`text-2xl font-black px-2.5 py-0.5 rounded-lg bg-white/20 ${getRank(score).color}`}>
                  ระดับ {getRank(score).rank}
                </span>
              </div>
            </div>
          </div>

          {/* Metric Graphical Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-xs text-slate-500">ตอบถูกต้อง</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {correctCount} <span className="text-xs text-slate-400">/ {totalQuestionsAnswered}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-center">
              <Target className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <div className="text-xs text-slate-500">ความแม่นยำ</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {totalQuestionsAnswered > 0
                  ? Math.round((correctCount / totalQuestionsAnswered) * 100)
                  : 0}
                %
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-center">
              <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <div className="text-xs text-slate-500">สตรีคสูงสุด</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {maxStreak} <span className="text-xs text-slate-400">ข้อ</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-center">
              <Clock className="w-5 h-5 text-sky-600 mx-auto mb-1" />
              <div className="text-xs text-slate-500">เฉลี่ยต่อข้อ</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {totalQuestionsAnswered > 0
                  ? ((duration - timeLeft) / totalQuestionsAnswered).toFixed(1)
                  : 0}
                s
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="speedtest-retry-btn"
              onClick={() => handleStartGame(duration)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              ลองใหม่อีกครั้ง ({duration} วินาที)
            </button>
            <button
              onClick={() => setGameState('idle')}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all"
            >
              กลับหน้าหลักการทดสอบ
            </button>
          </div>

          {/* Review Mistakes / Answers during this test */}
          {historyAnswers.length > 0 && (
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-sm font-bold text-slate-800">
                ทบทวนข้อที่ทำในการทดสอบรอบนี้ ({historyAnswers.length} ข้อ):
              </h4>
              <div className="space-y-3">
                {historyAnswers.map((h, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl border text-xs space-y-2 ${
                      h.isCorrect
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        {h.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>ข้อ {i + 1}: {h.question.title}</span>
                      </div>
                      <span className="font-bold text-slate-500">
                        เฉลย: {h.question.options[h.question.correctIndex]}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed pl-6">
                      {h.question.questionText}
                    </p>
                    <div className="pl-6 text-[11px] text-indigo-700 font-mono">
                      เทคนิคคิดเร็ว: {h.question.keyTakeaway}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
