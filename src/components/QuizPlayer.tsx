import React, { useState } from 'react';
import { Quiz, QuizAttempt } from '../types/index.ts';
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Award,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  ShieldCheck,
  User,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { COMPETENCY_NAMES } from '../server/scoring.ts';
import { AshokaEmblem } from './AshokaEmblem.tsx';

interface QuizPlayerProps {
  quiz: Quiz;
  onClose: () => void;
  onSubmitAttempt: (answers: { question_id: string; selected_index: number }[]) => Promise<{
    attempt: QuizAttempt;
    delta: { code: string; name: string; before: number; after: number; change: number };
  }>;
  onReturnToDashboard: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quiz,
  onClose,
  onSubmitAttempt,
  onReturnToDashboard,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState<{
    attempt: QuizAttempt;
    delta: { code: string; name: string; before: number; after: number; change: number };
  } | null>(null);

  const totalQuestions = quiz.questions.length;
  const currentQuestion = quiz.questions[currentIdx];
  const allAnswered = quiz.questions.every(q => selectedAnswers[q.id] !== undefined);

  const handleSelectOption = (optionIdx: number) => {
    if (attemptResult) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIdx,
    }));
  };

  const handleClearOption = () => {
    if (attemptResult) return;
    setSelectedAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    try {
      const answersPayload = quiz.questions.map(q => ({
        question_id: q.id,
        selected_index: selectedAnswers[q.id] ?? 0,
      }));

      const res = await onSubmitAttempt(answersPayload);
      setAttemptResult(res);

      if (res.attempt.score / res.attempt.total >= 0.6) {
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Results / Scorecard View ---
  if (attemptResult) {
    const { attempt, delta } = attemptResult;
    const pct = Math.round((attempt.score / attempt.total) * 100);
    const passed = pct >= 60;

    return (
      <div className="bg-white rounded-lg border border-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6 max-w-4xl mx-auto">
        {/* Government Official Scorecard Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AshokaEmblem className="w-9 h-12 text-[#8B4513]" color="#8B4513" />
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  भारत सरकार · GOVERNMENT OF INDIA
                </div>
                <div className="text-sm sm:text-base font-extrabold text-[#0B2545]">
                  Ministry of Statistics & Programme Implementation
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  Official Provisional Cadre Evaluation Scorecard · CBT Ref: MoSPI/CBT/2026/{attempt.id.slice(-6).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="text-right hidden sm:block border-l border-slate-300 pl-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Verification Stamp</div>
              <div className="text-xs font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>OFFICIALLY CERTIFIED</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {new Date(attempt.taken_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Results Banner */}
        <div
          className={`p-5 rounded-xl border text-center mb-6 ${
            passed
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-amber-50/80 border-amber-300 text-amber-950'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Cadre Competency: {COMPETENCY_NAMES[attempt.competency_code]} ({attempt.competency_code})
          </div>
          <h2 className="text-xl font-bold">
            {passed ? 'Assessment Completed with Qualifying Standards' : 'Assessment Attempt Recorded'}
          </h2>
          <div className="text-3xl font-extrabold my-2 text-slate-900">
            {attempt.score} / {attempt.total}{' '}
            <span className="text-base font-semibold text-slate-600">({pct}%)</span>
          </div>

          {delta && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-300 shadow-2xs text-xs font-bold">
              <Sparkles className="w-4 h-4 text-blue-700" />
              <span className="text-slate-900">
                Official Score Calibrated: {delta.before} → <span className="text-blue-700 font-extrabold">{delta.after}</span> ({delta.change >= 0 ? `+${delta.change}` : delta.change} pts)
              </span>
            </div>
          )}
        </div>

        {/* Question Review Section */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
            Item-Level Scrutiny & Statutory MoSPI Citations
          </h3>

          {quiz.questions.map((q, qIdx) => {
            const userAns = attempt.answers.find(a => a.question_id === q.id);
            const isCorrect = userAns?.is_correct;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border ${
                  isCorrect ? 'border-emerald-300 bg-emerald-50/30' : 'border-red-300 bg-red-50/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-slate-500 font-mono mt-0.5">
                      Q{qIdx + 1}.
                    </span>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                      {q.question}
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 uppercase tracking-wider ${
                      isCorrect ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                    }`}
                  >
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <div className="space-y-1.5 my-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userAns?.selected_index === optIdx;
                    const isTargetCorrect = q.correct_index === optIdx;

                    let optClass = 'border-slate-200 bg-white text-slate-700';
                    if (isTargetCorrect) {
                      optClass = 'border-emerald-400 bg-emerald-50 text-emerald-950 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optClass = 'border-red-400 bg-red-50 text-red-950 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`text-xs p-2.5 rounded-lg border flex items-center justify-between ${optClass}`}
                      >
                        <span>
                          <strong className="mr-2 font-mono text-slate-400">
                            ({String.fromCharCode(65 + optIdx)})
                          </strong>
                          {opt}
                        </span>
                        {isTargetCorrect && (
                          <span className="text-[10px] font-bold text-emerald-800 ml-2">
                            [Mandated Correct Option]
                          </span>
                        )}
                        {isSelected && !isTargetCorrect && (
                          <span className="text-[10px] font-bold text-red-700 ml-2">
                            [Candidate's Selection]
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-2 pt-2 border-t border-slate-200/80 text-xs text-slate-700 leading-relaxed flex items-start gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-800 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 font-semibold">Official Manual Citation:</strong>{' '}
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            onClick={() => {
              setAttemptResult(null);
              setSelectedAnswers({});
              setCurrentIdx(0);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Evaluation</span>
          </button>

          <button
            onClick={onReturnToDashboard}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold bg-[#0B2545] hover:bg-[#13315C] text-white rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <span>Return to Cadre Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
          </button>
        </div>
      </div>
    );
  }

  // --- Active Official CBT Interface ---
  return (
    <div className="bg-white rounded-lg border border-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.06)] max-w-4xl mx-auto overflow-hidden">
      {/* 1. Official CBT Header Strip */}
      <div className="bg-[#0B2545] text-white p-4 border-b border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AshokaEmblem className="w-8 h-10 text-amber-300" color="#FBBF24" />
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                Ministry of Statistics & Programme Implementation · Central Training Cell
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                Computer-Based Cadre Competency Evaluation: {quiz.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            Exit Exam
          </button>
        </div>
      </div>

      {/* 2. Candidate Status & Time Strip */}
      <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-700 font-medium">
        <div className="flex items-center gap-3">
          <span>
            Competency: <strong className="text-slate-900">{quiz.competency_code}</strong> (
            {COMPETENCY_NAMES[quiz.competency_code]})
          </span>
          <span className="text-slate-300">|</span>
          <span>
            Difficulty: <strong className="capitalize text-slate-900">{quiz.difficulty}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500">
            Total Questions: <strong>{totalQuestions}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] text-emerald-800 font-bold">
            Answered: {Object.keys(selectedAnswers).length} of {totalQuestions}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4">
        {/* Main Question Workspace (3 cols) */}
        <div className="md:col-span-3 p-6 border-r border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3 pb-2 border-b border-slate-200">
            <span className="font-bold text-blue-900">
              QUESTION NO. 0{currentIdx + 1}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Marks: 1.00 · Negative: 0.00
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-5 leading-relaxed">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-2.5 mb-6">
            {currentQuestion.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentQuestion.id] === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'border-blue-700 bg-blue-50/80 text-blue-950 font-bold shadow-2xs ring-1 ring-blue-700'
                      : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-[#0B2545] text-white'
                        : 'border border-slate-400 text-slate-600 bg-slate-100'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className="leading-snug pt-0.5">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-200 gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  currentIdx === 0
                    ? 'opacity-40 cursor-not-allowed text-slate-400 border-slate-200'
                    : 'text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleClearOption}
                className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Clear Response
              </button>
            </div>

            {currentIdx < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-[#0B2545] hover:bg-[#13315C] text-white rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <span>Save & Next</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-lg transition-all shadow-sm ${
                  allAnswered && !submitting
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{submitting ? 'Submitting Responses...' : 'Final Submit Exam'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Question Palette Sidebar (1 col) - Authentic Government CBT Exam Style */}
        <div className="p-4 bg-slate-50 space-y-4">
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Question Palette
            </div>
            <div className="grid grid-cols-4 gap-2">
              {quiz.questions.map((q, idx) => {
                const isAns = selectedAnswers[q.id] !== undefined;
                const isCurrent = currentIdx === idx;

                let btnClass = 'bg-white border-slate-300 text-slate-700';
                if (isCurrent) {
                  btnClass = 'bg-blue-900 text-white font-bold ring-2 ring-blue-700';
                } else if (isAns) {
                  btnClass = 'bg-emerald-600 text-white font-bold border-emerald-700';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`py-2 text-xs font-semibold rounded-md border text-center transition-colors cursor-pointer ${btnClass}`}
                  >
                    0{idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Palette Legend */}
          <div className="space-y-1.5 text-[11px] text-slate-600 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-blue-900 inline-block" />
              <span>Current Question</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-white border border-slate-300 inline-block" />
              <span>Not Answered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
