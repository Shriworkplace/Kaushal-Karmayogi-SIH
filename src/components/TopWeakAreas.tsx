import React from 'react';
import { CompetencyGapItem } from '../types/index.ts';
import { AlertCircle, ArrowRight, BookOpen, CheckCircle, FileQuestion } from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/i18n.ts';

interface TopWeakAreasProps {
  weakAreas: CompetencyGapItem[];
  lang: Language;
  onTakeQuiz: (competencyCode: string) => void;
  onBrowseCourses: (competencyCode: string) => void;
}

export const TopWeakAreas: React.FC<TopWeakAreasProps> = ({
  weakAreas,
  lang,
  onTakeQuiz,
  onBrowseCourses,
}) => {
  const t = TRANSLATIONS[lang];

  if (!weakAreas || weakAreas.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-300 p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3 text-emerald-700">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">All Role Targets Achieved!</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Your measured scores currently meet or exceed all designated benchmarks for your official cadre.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-300 p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <h2 className="text-base font-bold text-slate-900">{t.topWeakTitle}</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{t.topWeakSubtitle}</p>
      </div>

      <div className="space-y-3">
        {weakAreas.map((item, idx) => {
          // Calculate percentage towards target
          const pct = Math.min(100, Math.round((item.current / item.target) * 100));

          return (
            <div
              key={item.code}
              className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)] transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      0{idx + 1}. {item.name}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">({item.code})</span>
                    <span className="text-[11px] text-slate-500">· {item.frac_type}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-amber-700">
                    Gap: -{item.gap.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Score breakdown metrics without pill boxes */}
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <div className="flex items-center gap-2">
                  <span>Current: <strong className="text-slate-900">{item.current.toFixed(1)}</strong></span>
                  <span className="text-slate-300">/</span>
                  <span>Target: <strong className="text-slate-900">{item.target}</strong></span>
                </div>
                <span className="text-[11px] text-slate-500">{pct}% of benchmark</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-1.5 pt-2 border-t border-slate-200/60">
                <button
                  onClick={() => onBrowseCourses(item.code)}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 sm:border-transparent"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Matching Courses</span>
                </button>
                <button
                  onClick={() => onTakeQuiz(item.code)}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-950 px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
                >
                  <FileQuestion className="w-3.5 h-3.5 text-blue-700" />
                  <span>Attempt Quiz</span>
                  <ArrowRight className="w-3 h-3 ml-0.5 text-blue-700" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
