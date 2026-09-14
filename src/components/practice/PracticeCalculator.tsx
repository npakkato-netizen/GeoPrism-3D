import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Calculator as CalcIcon, 
  X, 
  Minimize2, 
  Maximize2, 
  Delete, 
  Copy, 
  Check, 
  History, 
  Sparkles,
  Equal,
  Pin,
  Move,
  Eye,
  EyeOff
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export interface PracticeCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  isDocked?: boolean;
  onToggleDock?: () => void;
}

interface CalcHistoryItem {
  id: string;
  expression: string;
  result: string;
  time: string;
}

/**
 * Safe mathematical expression evaluation
 */
function safeEvaluate(expr: string): { success: boolean; result: string } {
  try {
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, `${Math.PI}`)
      .replace(/\s+/g, '');

    if (!sanitized) {
      return { success: true, result: '0' };
    }

    // Handle sqrt(...)
    sanitized = sanitized.replace(/sqrt\(([^)]+)\)/g, (_, inside) => {
      const val = safeEvaluate(inside);
      if (!val.success) throw new Error('Invalid sqrt');
      const num = parseFloat(val.result);
      if (num < 0) throw new Error('Negative sqrt');
      return String(Math.sqrt(num));
    });

    // Handle exponents like a^b
    sanitized = sanitized.replace(/(\d+(\.\d+)?)\^(\d+(\.\d+)?)/g, (_, base, _2, exp) => {
      return String(Math.pow(parseFloat(base), parseFloat(exp)));
    });

    if (!/^[0-9+\-*/().eE]+$/.test(sanitized)) {
      return { success: false, result: 'รูปแบบไม่ถูกต้อง' };
    }

    // Evaluate in strict sandbox
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(`
      "use strict";
      return (${sanitized});
    `);
    const val = fn();

    if (typeof val !== 'number' || isNaN(val)) {
      return { success: false, result: 'คำนวณไม่ได้' };
    }

    if (!isFinite(val)) {
      return { success: false, result: 'ไม่สามารถหารด้วย 0 ได้' };
    }

    const formatted = Math.abs(val) > 1e12 || (Math.abs(val) < 1e-4 && val !== 0)
      ? val.toExponential(4)
      : parseFloat(val.toFixed(4)).toString();

    return { success: true, result: formatted };
  } catch {
    return { success: false, result: 'รูปแบบไม่ถูกต้อง' };
  }
}

export const PracticeCalculator: React.FC<PracticeCalculatorProps> = ({
  isOpen,
  onClose,
  isDocked = false,
  onToggleDock,
}) => {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [history, setHistory] = useState<CalcHistoryItem[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [piMode, setPiMode] = useState<'3.14' | '22/7' | 'precise'>('3.14');
  const [isTransparent, setIsTransparent] = useState<boolean>(false);

  // Dragging coordinates for floating mode
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  const cardRef = useRef<HTMLDivElement>(null);

  // Set initial floating position near right edge on mount if not docked
  useEffect(() => {
    if (!isDocked && pos === null && typeof window !== 'undefined') {
      const defaultX = Math.max(16, window.innerWidth - 380);
      const defaultY = Math.max(80, window.innerHeight - 560);
      setPos({ x: defaultX, y: defaultY });
    }
  }, [isDocked, pos]);

  // Drag handlers for mouse & touch
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (isDocked) return;
    setIsDragging(true);
    const currentX = pos?.x ?? (window.innerWidth - 380);
    const currentY = pos?.y ?? (window.innerHeight - 560);
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initX: currentX,
      initY: currentY,
    };
  }, [isDocked, pos]);

  const onMouseDownHeader = (e: React.MouseEvent) => {
    // Only drag when clicking the header background or move handle, not action buttons
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const onTouchStartHeader = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const touch = e.touches[0];
    if (touch) {
      handleDragStart(touch.clientX, touch.clientY);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      const newX = Math.min(Math.max(10, dragStartRef.current.initX + dx), window.innerWidth - 360);
      const newY = Math.min(Math.max(60, dragStartRef.current.initY + dy), window.innerHeight - 200);
      setPos({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const dx = touch.clientX - dragStartRef.current.startX;
      const dy = touch.clientY - dragStartRef.current.startY;
      const newX = Math.min(Math.max(10, dragStartRef.current.initX + dx), window.innerWidth - 340);
      const newY = Math.min(Math.max(60, dragStartRef.current.initY + dy), window.innerHeight - 200);
      setPos({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  // Keyboard support when calculator is active and not minimized
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        appendChar(key);
      } else if (['+', '-', '*', '/'].includes(key)) {
        const op = key === '*' ? '×' : key === '/' ? '÷' : key;
        appendChar(` ${op} `);
      } else if (key === '.') {
        appendChar('.');
      } else if (key === '(' || key === ')') {
        appendChar(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (key === 'Backspace') {
        handleBackspace();
      } else if (key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMinimized, expression]);

  if (!isOpen) return null;

  const appendChar = (char: string) => {
    soundFx.playClick();
    setExpression((prev) => {
      if ([' + ', ' - ', ' × ', ' ÷ '].includes(char) && [' + ', ' - ', ' × ', ' ÷ '].some(op => prev.endsWith(op))) {
        return prev.slice(0, -3) + char;
      }
      return prev + char;
    });
  };

  const handleClear = () => {
    soundFx.playClick();
    setExpression('');
    setResult('0');
  };

  const handleBackspace = () => {
    soundFx.playClick();
    setExpression((prev) => {
      if (prev.endsWith(' ')) {
        return prev.slice(0, -3);
      }
      return prev.slice(0, -1);
    });
  };

  const handleCalculate = () => {
    if (!expression.trim()) return;
    soundFx.playClick();
    const evalResult = safeEvaluate(expression);
    setResult(evalResult.result);

    if (evalResult.success && evalResult.result !== 'ไม่สามารถหารด้วย 0 ได้') {
      const newItem: CalcHistoryItem = {
        id: Date.now().toString(),
        expression: expression,
        result: evalResult.result,
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setHistory((prev) => [newItem, ...prev.slice(0, 19)]);
    }
  };

  const handleInsertPi = () => {
    soundFx.playClick();
    if (piMode === '3.14') {
      appendChar('3.14');
    } else if (piMode === '22/7') {
      appendChar('(22 ÷ 7)');
    } else {
      appendChar('π');
    }
  };

  const handleSquare = () => {
    soundFx.playClick();
    setExpression((prev) => (prev ? `(${prev})^2` : ''));
  };

  const handleSquareRoot = () => {
    soundFx.playClick();
    setExpression((prev) => `sqrt(${prev || result})`);
  };

  const handleCopyResult = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseHistoryItem = (item: CalcHistoryItem) => {
    soundFx.playClick();
    setExpression(item.result);
    setResult(item.result);
    setShowHistory(false);
  };

  // Minimized Floating Pill
  if (isMinimized) {
    return (
      <div 
        className={isDocked 
          ? "w-full p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between" 
          : "fixed bottom-5 right-5 z-50 animate-bounce-short"}
      >
        <button
          id="btn-calc-restore"
          onClick={() => {
            soundFx.playClick();
            setIsMinimized(false);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-600/30 text-xs font-bold transition-all transform hover:scale-105"
        >
          <CalcIcon className="w-4 h-4" />
          <span>เครื่องคิดเลข ({result})</span>
          <Maximize2 className="w-3.5 h-3.5 opacity-80" />
        </button>

        {isDocked && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-rose-500 p-1 rounded-lg"
            title="ปิดเครื่องคิดเลข"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Determine styling based on whether it is docked in sidebar or floating
  const floatingStyle: React.CSSProperties = isDocked
    ? {}
    : {
        position: 'fixed',
        left: pos ? `${pos.x}px` : undefined,
        top: pos ? `${pos.y}px` : undefined,
        zIndex: 50,
      };

  return (
    <div 
      ref={cardRef}
      style={floatingStyle}
      className={`bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col transition-opacity ${
        isDocked 
          ? 'w-full shadow-md' 
          : 'w-[330px] sm:w-[355px] shadow-2xl backdrop-blur-sm'
      } ${
        !isDocked && isTransparent 
          ? 'opacity-80 hover:opacity-100 hover:shadow-2xl' 
          : 'opacity-100'
      }`}
    >
      {/* Header Bar - Draggable when floating */}
      <div 
        onMouseDown={onMouseDownHeader}
        onTouchStart={onTouchStartHeader}
        className={`bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-3.5 py-2.5 flex items-center justify-between select-none ${
          !isDocked ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        title={!isDocked ? 'คลิกลากเพื่อย้ายตำแหน่งไปบริเวณที่ว่าง ไม่บังโจทย์' : undefined}
      >
        <div className="flex items-center gap-2">
          {!isDocked && (
            <div className="text-slate-400 p-0.5 rounded hover:text-white" title="ลากย้ายตำแหน่ง">
              <Move className="w-3.5 h-3.5" />
            </div>
          )}
          <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
            <CalcIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-wide flex items-center gap-1">
              <span>เครื่องช่วยคำนวณ</span>
              {isDocked && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                  ประกบคู่โจทย์
                </span>
              )}
            </h4>
            {!isDocked && (
              <p className="text-[9px] text-slate-300">ลากย้ายตำแหน่งได้ ไม่บังโจทย์</p>
            )}
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-1">
          {/* Dock / Undock Toggle */}
          {onToggleDock && (
            <button
              type="button"
              id="btn-calc-toggle-dock"
              onClick={() => {
                soundFx.playClick();
                onToggleDock();
              }}
              className={`p-1 rounded-lg text-xs transition-colors ${
                isDocked ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title={isDocked ? 'เปลี่ยนเป็นหน้าต่างลอยอิสระ (ลากย้ายได้)' : 'ตรึงข้างโจทย์ (ไม่บังตัวเลือก)'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Opacity Toggle when floating */}
          {!isDocked && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setIsTransparent(!isTransparent);
              }}
              className={`p-1 rounded-lg text-xs transition-colors ${
                isTransparent ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title={isTransparent ? 'ปรับเป็นทึบแสง 100%' : 'ปรับโปร่งแสงเพื่อมองทะลุโจทย์'}
            >
              {isTransparent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* History */}
          <button
            type="button"
            id="btn-calc-history"
            onClick={() => {
              soundFx.playClick();
              setShowHistory(!showHistory);
            }}
            className={`p-1 rounded-lg text-xs transition-colors ${
              showHistory ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="ประวัติการคำนวณ"
          >
            <History className="w-3.5 h-3.5" />
          </button>

          {/* Minimize */}
          <button
            type="button"
            id="btn-calc-minimize"
            onClick={() => {
              soundFx.playClick();
              setIsMinimized(true);
            }}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 text-xs transition-colors"
            title="ย่อหน้าต่าง"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>

          {/* Close */}
          <button
            type="button"
            id="btn-calc-close"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-white/10 text-xs transition-colors"
            title="ปิดเครื่องคิดเลข"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Pi Presets (Specific to Thai M.2 Curriculum) */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-[11px]">
        <span className="text-slate-500 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          ค่า π:
        </span>
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setPiMode('3.14')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
              piMode === '3.14' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="ใช้ค่าประมาณ 3.14"
          >
            ≈ 3.14
          </button>
          <button
            type="button"
            onClick={() => setPiMode('22/7')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
              piMode === '22/7' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="ใช้ค่าประมาณ 22/7"
          >
            ≈ 22/7
          </button>
          <button
            type="button"
            onClick={() => setPiMode('precise')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
              piMode === 'precise' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="ใช้ค่า π แม่นยำ (Math.PI)"
          >
            π ละเอียด
          </button>
        </div>
      </div>

      {/* Screen / Display Area */}
      <div className="p-3.5 bg-slate-900 text-white flex flex-col justify-end min-h-[80px] select-text">
        <div className="text-xs text-slate-400 font-mono overflow-x-auto whitespace-nowrap text-right h-5 scrollbar-none">
          {expression || ' '}
        </div>
        <div className="flex items-center justify-between mt-1">
          <button
            type="button"
            id="btn-calc-copy"
            onClick={handleCopyResult}
            className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
            title="คัดลอกคำตอบ"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
          </button>
          <div className="text-xl font-bold font-mono text-emerald-400 overflow-x-auto whitespace-nowrap scrollbar-none text-right max-w-[210px]">
            {result}
          </div>
        </div>
      </div>

      {/* History Drawer Overlay (if active) */}
      {showHistory ? (
        <div className="p-3 bg-slate-50 flex-1 overflow-y-auto max-h-[280px] space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-indigo-600" />
              ประวัติการคำนวณ ({history.length})
            </span>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-[10px] text-rose-600 hover:underline"
              >
                ล้างทั้งหมด
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              ยังไม่มีประวัติการคำนวณ
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleUseHistoryItem(item)}
                className="w-full text-left p-2 bg-white hover:bg-indigo-50/60 border border-slate-200 rounded-xl transition-all group"
              >
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{item.time}</span>
                  <span className="text-indigo-600 opacity-0 group-hover:opacity-100 font-semibold">คลิกเพื่อใช้ค่านี้ &rarr;</span>
                </div>
                <div className="text-xs text-slate-600 font-mono truncate">{item.expression} =</div>
                <div className="text-sm font-bold text-slate-900 font-mono">{item.result}</div>
              </button>
            ))
          )}
        </div>
      ) : (
        /* Calculator Keypad */
        <div className="p-2.5 bg-slate-100/70 grid grid-cols-4 gap-1.5 select-none text-xs">
          {/* Row 1: Geometry & Math helpers */}
          <button
            type="button"
            onClick={handleInsertPi}
            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold font-mono transition-colors shadow-2xs active:scale-95"
            title={`แทรกค่า ${piMode === '3.14' ? '3.14' : piMode === '22/7' ? '22/7' : 'π'}`}
          >
            π
          </button>
          <button
            type="button"
            onClick={handleSquare}
            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold font-mono transition-colors shadow-2xs active:scale-95"
            title="ยกกำลังสอง (r²)"
          >
            x²
          </button>
          <button
            type="button"
            onClick={handleSquareRoot}
            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold font-mono transition-colors shadow-2xs active:scale-95"
            title="รากที่สอง (√)"
          >
            √
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold transition-colors shadow-2xs active:scale-95"
            title="ล้างทั้งหมด"
          >
            C
          </button>

          {/* Row 2: Parentheses & Operators */}
          <button
            type="button"
            onClick={() => appendChar('(')}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold font-mono border border-slate-200/80 transition-colors shadow-2xs active:scale-95"
          >
            (
          </button>
          <button
            type="button"
            onClick={() => appendChar(')')}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold font-mono border border-slate-200/80 transition-colors shadow-2xs active:scale-95"
          >
            )
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200/80 flex items-center justify-center transition-colors shadow-2xs active:scale-95"
            title="ลบตัวล่าสุด"
          >
            <Delete className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button
            type="button"
            onClick={() => appendChar(' ÷ ')}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold font-mono transition-colors shadow-2xs active:scale-95 text-sm"
          >
            ÷
          </button>

          {/* Row 3: 7, 8, 9, × */}
          <button
            type="button"
            onClick={() => appendChar('7')}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm font-mono border border-slate-200/80 shadow-2xs active:scale-95"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => appendChar('8')}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm font-mono border border-slate-200/80 shadow-2xs active:scale-95"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => appendChar('9')}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm font-mono border border-slate-200/80 shadow-2xs active:scale-95"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => appendChar(' × ')}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold font-mono transition-colors shadow-2xs active:scale-95 text-sm"
          >
            ×
          </button>

          {/* Row 4: 4, 5, 6, - */}
          <button
            type="button"
            onClick={() => appendChar('4')}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm font-mono border border-slate-200/80 shadow-2xs active:scale-95"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => appendChar('5')}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm font-mono border border-slate-200/80 shadow-2xs active:scale-95"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => appendChar('6')}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm font-mono border border-slate-200/80 shadow-2xs active:scale-95"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => appendChar(' - ')}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold font-mono transition-colors shadow-2xs active:scale-95 text-sm"
          >
            -
          </button>

          {/* Row 5: 1, 2, 3, + */}
          <button
            type="button"
            onClick={() => appendChar('1')}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm font-mono border border-slate-200/80 shadow-2xs active:scale-95"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => appendChar('2')}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm font-mono border border-slate-200/80 shadow-2xs active:scale-95"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => appendChar('3')}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm font-mono border border-slate-200/80 shadow-2xs active:scale-95"
          >
            3
          </button>
          <button
            type="button"
            onClick={() => appendChar(' + ')}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold font-mono transition-colors shadow-2xs active:scale-95 text-sm"
          >
            +
          </button>

          {/* Row 6: 0, ., =, (spans 2) */}
          <button
            type="button"
            onClick={() => appendChar('0')}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm font-mono border border-slate-200/80 shadow-2xs active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => appendChar('.')}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm font-mono border border-slate-200/80 shadow-2xs active:scale-95"
          >
            .
          </button>
          <button
            type="button"
            id="btn-calc-equal"
            onClick={handleCalculate}
            className="col-span-2 p-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Equal className="w-3.5 h-3.5" />
            <span>คำนวณผลลัพธ์</span>
          </button>
        </div>
      )}

      {/* Footer Shortcut Bar */}
      <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
        <span>สูตรลัด:</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => appendChar(`2 × ${piMode === '22/7' ? '(22 ÷ 7)' : '3.14'} × `)}
            className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-mono hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            title="สูตร 2πr (เส้นรอบวง หรือ พื้นที่ผิวข้างทรงกระบอก)"
          >
            2πr...
          </button>
          <button
            type="button"
            onClick={() => appendChar(`${piMode === '22/7' ? '(22 ÷ 7)' : '3.14'} × `)}
            className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-mono hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            title="สูตร πr² (พื้นที่ฐานทรงกระบอก)"
          >
            πr²...
          </button>
        </div>
      </div>
    </div>
  );
};
