import React, { useState } from 'react';
import { X, Calculator, Info, CheckCircle2 } from 'lucide-react';
import { computeCurrentScore } from '../server/scoring.ts';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose }) => {
  // Mini simulator state
  const [simSelf, setSimSelf] = useState(2.0);
  const [simN, setSimN] = useState(5);
  const [simCorrect, setSimCorrect] = useState(4);

  if (!isOpen) return null;

  // Correct questions cannot exceed n
  const validCorrect = Math.min(simCorrect, simN);
  const simAccuracy = simN > 0 ? validCorrect / simN : 0;
  const q5 = 1 + 4 * simAccuracy;
  const w = Math.min(0.7, 0.05 * simN);
  const simCurrent = Number(((1 - w) * simSelf + w * q5).toFixed(1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-[#0b2545] text-white rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h2 className="text-sm sm:text-base font-bold">Deterministic Scoring Formula (PRD §6.1)</h2>
              <p className="text-[11px] sm:text-xs text-slate-300">Rule-based Bayesian evidence blending without LLM guesswork</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Formula Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Mathematical Specification
            </h3>
            <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs sm:text-sm text-slate-900 overflow-x-auto">
              current = (1 − w) × self + w × (1 + 4 × q)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs text-slate-600">
              <div>
                <strong className="text-slate-800">self:</strong> Latest self-rating (scale 1.0–5.0)
              </div>
              <div>
                <strong className="text-slate-800">n:</strong> Cumulative quiz questions answered
              </div>
              <div>
                <strong className="text-slate-800">q:</strong> Fraction correct answers (0.0–1.0)
              </div>
              <div>
                <strong className="text-slate-800">w:</strong> Evidence weight = min(0.70, 0.05 × n)
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200/70">
              <strong>Rationale:</strong> Self-rating acts as the foundation prior. As an official attempts more verified quiz questions, empirical evidence gradually dominates the score (up to a ceiling of 70%), preserving stability while directly rewarding proven mastery.
            </p>
          </div>

          {/* Interactive Simulator */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                <span>Interactive Blend Simulator</span>
              </h3>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                Live Calculation
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Slider 1: Self Rating */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Initial Self-Rating (self):</span>
                  <span className="font-bold text-slate-900">{simSelf.toFixed(1)} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={simSelf}
                  onChange={e => setSimSelf(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Slider 2: Questions Answered */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Questions Attempted (n):</span>
                  <span className="font-bold text-slate-900">{simN} questions</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={simN}
                  onChange={e => {
                    const newN = parseInt(e.target.value);
                    setSimN(newN);
                    if (simCorrect > newN) setSimCorrect(newN);
                  }}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: Correct Questions */}
              {simN > 0 && (
                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Correct Answers:</span>
                    <span className="font-bold text-slate-900">
                      {validCorrect} of {simN} ({Math.round(simAccuracy * 100)}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={simN}
                    step="1"
                    value={validCorrect}
                    onChange={e => setSimCorrect(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              )}

              {/* Result computation box */}
              <div className="mt-4 p-3.5 bg-white rounded-lg border border-blue-200 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-500">
                    Evidence Weight (w): <strong>{(w * 100).toFixed(0)}%</strong> · Quiz Scaled (q5):{' '}
                    <strong>{q5.toFixed(2)}</strong>
                  </div>
                  <div className="text-xs text-slate-700">
                    Blend: ({((1 - w) * 100).toFixed(0)}% × {simSelf}) + ({(w * 100).toFixed(0)}% × {q5.toFixed(2)})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-500">Computed Score:</div>
                  <div className="text-xl font-extrabold text-blue-700">{simCurrent.toFixed(1)} / 5</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close Explainer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
