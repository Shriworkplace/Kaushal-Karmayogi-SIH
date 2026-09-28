import React, { useState } from 'react';
import { Quiz, CompetencyCode } from '../types/index.ts';
import { SEED_COMPETENCIES } from '../server/seed.ts';
import {
  FileQuestion,
  Clock,
  ArrowRight,
  CheckCircle,
  Award,
  Filter,
} from 'lucide-react';
import { COMPETENCY_NAMES } from '../server/scoring.ts';
import { Language, TRANSLATIONS } from '../utils/i18n.ts';

interface QuizzesListProps {
  quizzes: Quiz[];
  onSelectQuiz: (quiz: Quiz) => void;
  lang: Language;
  filterCompetency?: string;
  onFilterChange?: (code: string) => void;
  userAttempts?: { quiz_id: string; score: number; total: number; taken_at: string }[];
}

export const QuizzesList: React.FC<QuizzesListProps> = ({
  quizzes,
  onSelectQuiz,
  lang,
  filterCompetency = 'all',
  onFilterChange,
  userAttempts = [],
}) => {
  const [selectedComp, setSelectedComp] = useState<string>(filterCompetency);
  const t = TRANSLATIONS[lang];

  const handleFilter = (code: string) => {
    setSelectedComp(code);
    onFilterChange?.(code);
  };

  const filtered = quizzes.filter(q => {
    if (selectedComp !== 'all' && q.competency_code !== selectedComp) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header & Filter */}
      <div className="bg-white rounded-lg border border-slate-300 p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                ASSESSMENT PORTAL
              </span>
              <span className="text-slate-300">|</span>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-blue-700" />
                <span>Diagnostic Assessments & Quizzes (CBT)</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Attempt verified quizzes to recalibrate your competency scores without a page reload (PRD §4.5).
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            {filtered.length} assessment modules available
          </span>
        </div>

        {/* Competency filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => handleFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              selectedComp === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Competencies
          </button>
          {SEED_COMPETENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => handleFilter(c.code)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                selectedComp === c.code
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.code} ({c.name.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(quiz => {
          // Check if user previously attempted this quiz
          const pastAttempt = userAttempts.find(a => a.quiz_id === quiz.id);

          return (
            <div
              key={quiz.id}
              className="p-5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 shadow-[0_2px_6px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="font-bold text-slate-900">{quiz.competency_code}</span>
                    <span>·</span>
                    <span>{COMPETENCY_NAMES[quiz.competency_code]}</span>
                    <span>·</span>
                    <span className="capitalize">{quiz.difficulty}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      quiz.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {quiz.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 leading-snug">
                  {quiz.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <FileQuestion className="w-3.5 h-3.5 text-slate-400" />
                    <span>{quiz.questions.length} Questions</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>~{quiz.questions.length * 2} Mins</span>
                  </span>
                </div>

                {pastAttempt && (
                  <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200/70 mb-3 text-xs text-blue-900 flex items-center justify-between">
                    <span className="font-medium">Previous Attempt Score:</span>
                    <strong className="font-bold">
                      {pastAttempt.score} / {pastAttempt.total} ({Math.round((pastAttempt.score / pastAttempt.total) * 100)}%)
                    </strong>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {pastAttempt ? 'Retakes welcomed' : 'Instant score update on submit'}
                </span>

                <button
                  onClick={() => onSelectQuiz(quiz)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <span>{pastAttempt ? 'Retake Quiz' : 'Start Assessment'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-300 p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center">
          <p className="text-sm font-semibold text-slate-700">No quizzes found for this competency filter.</p>
          <button
            onClick={() => handleFilter('all')}
            className="mt-2 text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
          >
            Show all published quizzes
          </button>
        </div>
      )}
    </div>
  );
};
