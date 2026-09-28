import React from 'react';
import { Course, CourseRecommendation } from '../types/index.ts';
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  BookmarkCheck,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/i18n.ts';

interface RecommendedCoursesProps {
  recommendations: CourseRecommendation[];
  completedCourseIds: string[];
  onToggleComplete: (courseId: string) => void;
  onOpenIgotModal: (course: Course) => void;
  lang: Language;
}

export const RecommendedCourses: React.FC<RecommendedCoursesProps> = ({
  recommendations,
  completedCourseIds,
  onToggleComplete,
  onOpenIgotModal,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-300 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center">
        <BookmarkCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-900">No Pending Course Recommendations</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          You have either completed all prioritized modules or your scores currently meet the cadre targets.
          Visit the full catalog to explore elective specializations.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-300 p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              iGOT E-LEARNING
            </span>
            <span className="text-slate-300">|</span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Recommended Courses (iGOT Karmayogi)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ranked by deterministic gap-weight fit (§6.3) with verified reason justifications.
          </p>
        </div>
        <span className="text-[11px] sm:text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 w-fit">
          Showing top {recommendations.length} recommendations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map(({ course, score, reason, covered_gaps }) => {
          const isCompleted = completedCourseIds.includes(course.id);

          return (
            <div
              key={course.id}
              className="flex flex-col justify-between p-4.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 shadow-[0_2px_6px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all"
            >
              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-slate-900 font-bold">{course.id}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{course.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span>{course.language}</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{course.duration_mins} min</span>
                  </div>
                </div>

                {/* Course Title */}
                <h3 className="text-sm font-bold text-slate-900 mb-1.5 line-clamp-2 leading-snug">
                  {course.title}
                </h3>

                {/* Course Description */}
                <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                  {course.description}
                </p>

                {/* Competencies Covered with weights */}
                <div className="text-[11px] text-slate-600 mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-slate-700">Covers:</span>
                  {course.competencies.map((cw, idx) => (
                    <span key={cw.code} className="inline-flex items-center gap-0.5 font-medium">
                      <span>{cw.code}</span>
                      <span className="text-amber-600 text-[10px]">
                        {'●'.repeat(cw.weight)}
                      </span>
                      {idx < course.competencies.length - 1 && (
                        <span className="text-slate-300 ml-1">·</span>
                      )}
                    </span>
                  ))}
                </div>

                {/* Mandatory PRD Why Recommended Reason Box */}
                <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 mb-3 text-xs text-slate-800 leading-relaxed">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>{t.whyRecommended}</span>
                  </div>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: reason.replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="text-slate-900 font-bold">$1</strong>'
                      ),
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <button
                  onClick={() => onToggleComplete(course.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      isCompleted ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{isCompleted ? t.completed : t.markCompleted}</span>
                </button>

                <button
                  onClick={() => onOpenIgotModal(course)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  <span>{t.openOnIgot}</span>
                  <ExternalLink className="w-3 h-3 text-amber-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
