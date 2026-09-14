import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  Shuffle, 
  Lightbulb, 
  ArrowRight,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  RotateCcw,
  Calculator
} from 'lucide-react';
import { Question, QuestionCategory, UserProgress } from '../../types';
import { QUESTIONS_POOL } from '../../data/questions';
import { soundFx } from '../../utils/audio';
import { PracticeCalculator } from './PracticeCalculator';

interface PracticeModeProps {
  progress: UserProgress;
  onAnswerQuestion: (question: Question, isCorrect: boolean) => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  progress,
  onAnswerQuestion,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isDocked, setIsDocked] = useState<boolean>(true);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return QUESTIONS_POOL.filter((q) => {
      const matchCat = selectedCategory === 'all' || q.category === selectedCategory;
      const matchDiff = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
      return matchCat && matchDiff;
    });
  }, [selectedCategory, filterDifficulty]);

  const currentQuestion: Question | undefined = filteredQuestions[currentIndex];

  // Reset state on question change
  const handleSelectQuestion = (index: number) => {
    setCurrentIndex(index);
    setSelectedOption(null);
    setHasSubmitted(false);
    setShowHint(false);
  };

  const handleOptionClick = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedOption(idx);
    soundFx.playClick();
  };

  const handleSubmit = () => {
    if (selectedOption === null || hasSubmitted || !currentQuestion) return;
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    setHasSubmitted(true);

    if (isCorrect) {
      soundFx.playCorrect();
    } else {
      soundFx.playWrong();
    }

    onAnswerQuestion(currentQuestion, isCorrect);
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      handleSelectQuestion(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handleSelectQuestion(currentIndex - 1);
    }
  };

  const handleRandom = () => {
    if (filteredQuestions.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * filteredQuestions.length);
    if (nextIdx === currentIndex) {
      nextIdx = (nextIdx + 1) % filteredQuestions.length;
    }
    handleSelectQuestion(nextIdx);
  };

  const categoryNames: Record<string, string> = {
    all: 'แบบฝึกหัดทั้งหมด',
    prism_surface: 'พื้นที่ผิวปริซึม',
    prism_volume: 'ปริมาตรปริซึม',
    cylinder_surface: 'พื้นที่ผิวทรงกระบอก',
    cylinder_volume: 'ปริมาตรทรงกระบอก',
    cross_section: 'การตัดขวาง 3 มิติ',
    applied_realworld: 'โจทย์ประยุกต์ในชีวิตจริง',
  };

  if (!currentQuestion) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm max-w-xl mx-auto my-8">
        <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">ไม่พบแบบฝึกหัดในหมวดนี้</h3>
        <p className="text-sm text-slate-500 mt-1">ลองเปลี่ยนตัวกรองหมวดหมู่หรือระดับความยาก</p>
        <button
          onClick={() => {
            setSelectedCategory('all');
            setFilterDifficulty('all');
          }}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
        >
          ล้างตัวกรองทั้งหมด
        </button>
      </div>
    );
  }

  const isCompleted = progress.completedQuestionIds.includes(currentQuestion.id);

  return (
    <div className={`w-full ${isCalculatorOpen && isDocked ? 'max-w-6xl' : 'max-w-5xl'} mx-auto space-y-6 transition-all duration-200`}>
      {/* Category Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-bold text-slate-800">เลือกหมวดหมู่ฝึกฝน:</span>
            <span className="text-xs text-slate-400">({filteredQuestions.length} ข้อ)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">ระดับความยาก:</span>
            <select
              value={filterDifficulty}
              onChange={(e) => {
                setFilterDifficulty(e.target.value);
                setCurrentIndex(0);
                setSelectedOption(null);
                setHasSubmitted(false);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
            >
              <option value="all">ทุกระดับ</option>
              <option value="easy">ระดับเริ่มต้น (ง่าย)</option>
              <option value="medium">ระดับปานกลาง</option>
              <option value="hard">ระดับท้าทาย (ยาก)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(categoryNames).map(([catKey, catLabel]) => {
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => {
                  setSelectedCategory(catKey);
                  setCurrentIndex(0);
                  setSelectedOption(null);
                  setHasSubmitted(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {catLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Card & Docked Calculator Container */}
      <div className={`grid gap-6 items-start ${isCalculatorOpen && isDocked ? 'lg:grid-cols-[1fr,355px]' : 'grid-cols-1'}`}>
        {/* Main Question Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6 min-w-0">
        {/* Header Badges & Question Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              ข้อที่ {currentIndex + 1} / {filteredQuestions.length}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {categoryNames[currentQuestion.category] || currentQuestion.category}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                currentQuestion.difficulty === 'easy'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : currentQuestion.difficulty === 'medium'
                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                  : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}
            >
              {currentQuestion.difficulty === 'easy'
                ? 'ระดับเริ่มต้น'
                : currentQuestion.difficulty === 'medium'
                ? 'ระดับปานกลาง'
                : 'ระดับท้าทาย'}
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                <Check className="w-3 h-3 text-emerald-600" /> เคยทำถูกแล้ว
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-practice-calculator-toggle"
              onClick={() => {
                soundFx.playClick();
                setIsCalculatorOpen(!isCalculatorOpen);
              }}
              className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all shadow-2xs active:scale-95 ${
                isCalculatorOpen
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/90'
              }`}
              title="เปิดเครื่องช่วยคำนวณสำหรับคิดเลขพื้นที่ผิวและปริมาตร"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>เครื่องช่วยคำนวณ</span>
            </button>

            <button
              onClick={handleRandom}
              className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
              title="สุ่มข้ออื่นในหมวดนี้"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>สุ่มข้อ</span>
            </button>
          </div>
        </div>

        {/* Real-world Scenario Badge (if applicable) */}
        {currentQuestion.realWorldScenario && (
          <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-2.5 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div className="text-xs text-sky-900">
              <strong className="font-semibold text-sky-950">การประยุกต์ใช้งานจริง: </strong>
              {currentQuestion.realWorldScenario}
            </div>
          </div>
        )}

        {/* Question Title & Text */}
        <div className="space-y-3">
          <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
            {currentQuestion.title}
          </h3>
          <p className="text-base text-slate-700 leading-relaxed">
            {currentQuestion.questionText}
          </p>
        </div>

        {/* Diagram Dimensions Badge (if available) */}
        {currentQuestion.diagramInfo && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span className="text-xs font-bold text-slate-800">
                {currentQuestion.diagramInfo.shapeName}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(currentQuestion.diagramInfo.dimensions).map(([dimKey, dimVal]) => (
                <span
                  key={dimKey}
                  className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-mono"
                >
                  <span className="text-slate-400">{dimKey}:</span> {dimVal}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hint toggle */}
        <div>
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            {showHint ? 'ซ่อนคำใบ้' : 'ต้องการคำใบ้แนวคิด?'}
          </button>
          {showHint && (
            <div className="mt-2 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>คำใบ้:</strong> {currentQuestion.hint}
            </div>
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-2.5 pt-2">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctIndex;

            let buttonClass = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';

            if (isSelected && !hasSubmitted) {
              buttonClass = 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-sm';
            } else if (hasSubmitted) {
              if (isCorrect) {
                buttonClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
              } else if (isSelected && !isCorrect) {
                buttonClass = 'bg-rose-50 border-rose-400 text-rose-950';
              } else {
                buttonClass = 'bg-slate-50 border-slate-200 opacity-60 text-slate-500';
              }
            }

            return (
              <button
                key={idx}
                id={`practice-option-${idx}`}
                disabled={hasSubmitted}
                onClick={() => handleOptionClick(idx)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${buttonClass}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm font-medium">{option}</span>
                </div>

                {hasSubmitted && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {hasSubmitted && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Submit or Next Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> ก่อนหน้า
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === filteredQuestions.length - 1}
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
            >
              ถัดไป <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!hasSubmitted ? (
            <button
              id="practice-submit-btn"
              disabled={selectedOption === null}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5"
            >
              ตรวจคำตอบ
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentIndex === filteredQuestions.length - 1}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5"
            >
              ข้อถัดไป
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Detailed Step-by-Step Solution (Visible after submitting) */}
        {hasSubmitted && (
          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-sm md:text-base">
                  คำอธิบายสูตรและการคำนวณทีละขั้นตอนอย่างละเอียด
                </h4>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  selectedOption === currentQuestion.correctIndex
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {selectedOption === currentQuestion.correctIndex
                  ? 'ยอดเยี่ยม! คุณตอบถูกต้อง (+10 เหรียญ)'
                  : 'ยังไม่ถูกต้อง ดูแนวคิดด้านล่าง'}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {currentQuestion.solutionSteps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {step.stepNumber}
                    </span>
                    <span className="text-xs md:text-sm font-bold text-slate-800">
                      {step.title}
                    </span>
                  </div>

                  {step.formula && (
                    <div className="text-xs bg-indigo-50/50 text-indigo-900 px-3 py-1.5 rounded-lg font-mono border border-indigo-100/80">
                      <strong className="text-indigo-600 font-sans">สูตร: </strong>
                      {step.formula}
                    </div>
                  )}

                  <div className="text-xs md:text-sm font-mono text-slate-700 whitespace-pre-line bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    {step.calculation}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                    {step.explanation}
                  </p>
                </div>
              ))}
            </div>

            {/* Key takeaway */}
            {currentQuestion.keyTakeaway && (
              <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-amber-900">เทคนิคจำสำคัญ: </strong>
                  {currentQuestion.keyTakeaway}
                </div>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Docked Calculator (Beside Question on Large Screens) */}
        {isCalculatorOpen && isDocked && (
          <div className="hidden lg:block sticky top-6">
            <PracticeCalculator
              isOpen={isCalculatorOpen}
              onClose={() => setIsCalculatorOpen(false)}
              isDocked={true}
              onToggleDock={() => setIsDocked(false)}
            />
          </div>
        )}
      </div>

      {/* Question Selector Dots Carousel */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
          <span>เลือกข้ามไปยังข้อที่ต้องการ:</span>
          <span>ความคืบหน้า: {Math.round(((currentIndex + 1) / filteredQuestions.length) * 100)}%</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filteredQuestions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const completed = progress.completedQuestionIds.includes(q.id);
            return (
              <button
                key={q.id}
                onClick={() => handleSelectQuestion(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                    : completed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Quick Calculator Button if Closed */}
      {!isCalculatorOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            id="btn-floating-calculator"
            onClick={() => {
              soundFx.playClick();
              setIsCalculatorOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-600/30 text-xs font-bold transition-all transform hover:scale-105 active:scale-95 border border-indigo-500/50"
            title="เปิดเครื่องช่วยคำนวณ"
          >
            <Calculator className="w-4 h-4" />
            <span>เครื่องช่วยคำนวณ</span>
          </button>
        </div>
      )}

      {/* Practice Mode Interactive Calculator (Floating mode, or mobile/tablet screen fallback) */}
      {isCalculatorOpen && (
        <div className={isDocked ? 'block lg:hidden' : 'block'}>
          <PracticeCalculator
            isOpen={isCalculatorOpen}
            onClose={() => setIsCalculatorOpen(false)}
            isDocked={false}
            onToggleDock={() => setIsDocked(!isDocked)}
          />
        </div>
      )}
    </div>
  );
};
