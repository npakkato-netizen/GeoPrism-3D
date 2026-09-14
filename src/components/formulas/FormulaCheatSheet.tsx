import React, { useState } from 'react';
import { 
  BookOpen, 
  Box, 
  Cylinder, 
  Calculator, 
  Sparkles, 
  Lightbulb, 
  ArrowRightLeft,
  Check
} from 'lucide-react';

export const FormulaCheatSheet: React.FC = () => {
  // Quick Converter
  const [cm3Val, setCm3Val] = useState<string>('1000');
  const [litersVal, setLitersVal] = useState<string>('1');
  const [m3Val, setM3Val] = useState<string>('0.001');

  const handleCm3Change = (val: string) => {
    setCm3Val(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setLitersVal((num / 1000).toString());
      setM3Val((num / 1000000).toString());
    }
  };

  const handleLitersChange = (val: string) => {
    setLitersVal(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setCm3Val((num * 1000).toString());
      setM3Val((num / 1000).toString());
    }
  };

  const handleM3Change = (val: string) => {
    setM3Val(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setCm3Val((num * 1000000).toString());
      setLitersVal((num * 1000).toString());
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <BookOpen className="w-3.5 h-3.5" />
            คลังสรุปสูตรและเทคนิคจำ
          </span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">
          คู่มือสรุปสูตรพื้นที่ผิวและปริมาตร (Prism & Cylinder Formula Guide)
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          รวบรวมแก่นแนวคิดที่สำคัญ พร้อมเทคนิคคิดลัดและการแปลงหน่วยที่มักออกข้อสอบบ่อย
        </p>
      </div>

      {/* 2 Big Cards: Prism vs Cylinder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prism Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
          <div className="flex items-center gap-2.5 text-indigo-700 pb-2 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Box className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">1. ปริซึม (Prism)</h3>
              <p className="text-[11px] text-slate-500">รูปเรขาคณิตสามมิติที่มีฐานขนานและเท่ากันทุกประการ</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800">พื้นที่ผิวข้าง (Lateral Area):</span>
              <div className="font-mono text-indigo-600 font-bold text-sm bg-white p-2 rounded-lg border border-slate-200">
                พื้นที่ผิวข้าง = ความยาวรอบรูปของฐาน × ความสูง
              </div>
              <p className="text-[11px] text-slate-500">
                (เพราะเมื่อคลี่ผิวข้างออก จะได้รูปสี่เหลี่ยมผืนผ้าผืนใหญ่)
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800">พื้นที่ผิวทั้งหมด (Total Surface Area):</span>
              <div className="font-mono text-indigo-600 font-bold text-sm bg-white p-2 rounded-lg border border-slate-200">
                พื้นที่ผิวทั้งหมด = 2(พื้นที่ฐาน) + พื้นที่ผิวข้าง
              </div>
              <p className="text-[11px] text-slate-500">
                (ฐานบน + ฐานล่าง + ผิวข้างทั้งหมด)
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800">ปริมาตร (Volume):</span>
              <div className="font-mono text-emerald-600 font-bold text-sm bg-white p-2 rounded-lg border border-slate-200">
                ปริมาตร = พื้นที่ฐาน × ความสูง
              </div>
            </div>

            <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/70 text-amber-950 space-y-1.5">
              <span className="font-bold flex items-center gap-1 text-amber-900">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                สูตรพื้นที่ฐานที่เจอบ่อย:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900/90 font-mono">
                <li>สี่เหลี่ยมผืนผ้า = กว้าง × ยาว</li>
                <li>สี่เหลี่ยมจัตุรัส = ด้าน × ด้าน (หรือ ด้าน²)</li>
                <li>สามเหลี่ยมทั่วไป = 1/2 × ฐาน × สูง</li>
                <li>สามเหลี่ยมด้านเท่า = (√3 / 4) × ด้าน²</li>
                <li>สี่เหลี่ยมคางหมู = 1/2 × (ผลบวกด้านคู่ขนาน) × สูง</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cylinder Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
          <div className="flex items-center gap-2.5 text-indigo-700 pb-2 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Cylinder className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">2. ทรงกระบอก (Cylinder)</h3>
              <p className="text-[11px] text-slate-500">ปริซึมที่มีฐานเป็นรูปวงกลม</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800">พื้นที่ผิวข้าง (Lateral Area):</span>
              <div className="font-mono text-indigo-600 font-bold text-sm bg-white p-2 rounded-lg border border-slate-200">
                พื้นที่ผิวข้าง = 2πrh (หรือ πdh)
              </div>
              <p className="text-[11px] text-slate-500">
                (เส้นรอบวง 2πr คลี่ออกเป็นด้านยาว คูณกับความสูง h)
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800">พื้นที่ผิวทั้งหมด (Total Surface Area):</span>
              <div className="font-mono text-indigo-600 font-bold text-sm bg-white p-2 rounded-lg border border-slate-200">
                พื้นที่ผิวทั้งหมด = 2πr² + 2πrh = 2πr(r + h)
              </div>
              <p className="text-[11px] text-slate-500">
                (พื้นที่ฝากลมหัว-ท้าย 2 ด้าน + ผิวข้างรอบตัว)
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800">ปริมาตร (Volume):</span>
              <div className="font-mono text-emerald-600 font-bold text-sm bg-white p-2 rounded-lg border border-slate-200">
                ปริมาตร = πr²h
              </div>
            </div>

            <div className="bg-sky-50/60 p-3.5 rounded-2xl border border-sky-200/70 text-sky-950 space-y-1.5">
              <span className="font-bold flex items-center gap-1 text-sky-900">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                ทรงกระบอกกลวง (ท่อคอนกรีต/ท่อเหล็ก):
              </span>
              <div className="text-[11px] text-sky-900/90 space-y-1 font-mono">
                <div>ปริมาตรเนื้อท่อ = π(R² - r²)h</div>
                <div>พื้นที่ผิวทั้งหมด = 2πRh + 2πrh + 2π(R² - r²)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Unit Converter & Constants Tool */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base md:text-lg font-bold text-slate-900">
            เครื่องมือแปลงหน่วยปริมาตรและมาตราส่วนแบบรวดเร็ว
          </h3>
        </div>

        <p className="text-xs text-slate-500">
          ลองพิมพ์ตัวเลขในช่องใดช่องหนึ่งเพื่อดูการแปลงระหว่าง ลูกบาศก์เซนติเมตร (ลบ.ซม.), ลิตร, และลูกบาศก์เมตร (ลบ.ม.)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              ลูกบาศก์เซนติเมตร (cm³ หรือ ลบ.ซม.)
            </label>
            <input
              type="number"
              value={cm3Val}
              onChange={(e) => handleCm3Change(e.target.value)}
              className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-800 text-sm focus:outline-indigo-600"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              ลิตร (Liters)
            </label>
            <input
              type="number"
              value={litersVal}
              onChange={(e) => handleLitersChange(e.target.value)}
              className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-indigo-600 text-sm focus:outline-indigo-600"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              ลูกบาศก์เมตร (m³ หรือ ลบ.ม.)
            </label>
            <input
              type="number"
              value={m3Val}
              onChange={(e) => handleM3Change(e.target.value)}
              className="w-full bg-white px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-emerald-600 text-sm focus:outline-indigo-600"
            />
          </div>
        </div>

        {/* Cheat sheet table */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>1,000 ลบ.ซม. = 1 ลิตร</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>1,000 ลิตร = 1 ลบ.ม.</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>1 ตร.ม. = 10,000 ตร.ซม.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
