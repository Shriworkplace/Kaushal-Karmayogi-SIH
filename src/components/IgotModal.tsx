import React from 'react';
import { Course } from '../types/index.ts';
import { X, ExternalLink, BookOpen, Clock, Globe, Award, Shield, CheckCircle2 } from 'lucide-react';
import { COMPETENCY_NAMES } from '../server/scoring.ts';

interface IgotModalProps {
  course: Course | null;
  onClose: () => void;
  isCompleted: boolean;
  onToggleComplete: (courseId: string) => void;
}

export const IgotModal: React.FC<IgotModalProps> = ({
  course,
  onClose,
  isCompleted,
  onToggleComplete,
}) => {
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Mock iGOT Header */}
        <div className="bg-[#0b2545] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-amber-500 text-slate-900 font-extrabold flex items-center justify-center text-sm shrink-0">
              iGOT
            </div>
            <div>
              <div className="text-[10px] sm:text-xs uppercase font-bold text-amber-400 tracking-wider">
                Integrated Government Online Training
              </div>
              <div className="text-xs sm:text-sm font-semibold">iGOT Karmayogi Course Preview</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Details Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-slate-900">{course.id}</span>
            <span>·</span>
            <span className="capitalize">{course.difficulty}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" />
              {course.language}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {course.duration_mins} Minutes
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {course.title}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            {course.description}
          </p>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Competencies Targeted (FRAC Tagged)
            </div>
            <div className="space-y-1.5">
              {course.competencies.map(cw => (
                <div key={cw.code} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    {COMPETENCY_NAMES[cw.code]} ({cw.code})
                  </span>
                  <span className="text-amber-700 font-bold">
                    {'●'.repeat(cw.weight)}{' '}
                    <span className="text-slate-400 font-normal text-[11px]">
                      ({cw.weight === 3 ? 'Primary focus' : cw.weight === 2 ? 'Secondary' : 'Light'})
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Positioning Notice:</strong> Kaushal Karmayogi operates as the intelligence and assessment layer. Official enrolments, videos, and certifications occur on the central <strong>iGOT Karmayogi portal</strong>.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => onToggleComplete(course.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{isCompleted ? 'Marked Completed' : 'Mark as Completed'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <a
              href={course.mock_url}
              target="_blank"
              rel="noreferrer"
              onClick={e => {
                e.preventDefault();
                alert(`Simulated launch of external iGOT Karmayogi course URL:\n${course.mock_url}\n\n(As per PRD §1.4 & §16, iGOT link is a mock stand-in.)`);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Enrol on iGOT Karmayogi</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
