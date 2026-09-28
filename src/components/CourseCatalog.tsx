import React, { useState } from 'react';
import { Course, CompetencyCode, DifficultyLevel } from '../types/index.ts';
import {
  Search,
  Clock,
  ExternalLink,
  CheckCircle2,
  Filter,
  BookOpen,
} from 'lucide-react';
import { SEED_COMPETENCIES } from '../server/seed.ts';
import { Language, TRANSLATIONS } from '../utils/i18n.ts';

interface CourseCatalogProps {
  courses: Course[];
  completedCourseIds: string[];
  onToggleComplete: (courseId: string) => void;
  onOpenIgotModal: (course: Course) => void;
  lang: Language;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  courses,
  completedCourseIds,
  onToggleComplete,
  onOpenIgotModal,
  lang,
}) => {
  const [search, setSearch] = useState('');
  const [selectedComp, setSelectedComp] = useState<string>('all');
  const [selectedDiff, setSelectedDiff] = useState<string>('all');
  const [selectedLang, setSelectedLang] = useState<string>('all');

  const t = TRANSLATIONS[lang];

  const filteredCourses = courses.filter(course => {
    if (selectedComp !== 'all') {
      if (!course.competencies.some(cw => cw.code === selectedComp)) {
        return false;
      }
    }
    if (selectedDiff !== 'all' && course.difficulty !== selectedDiff) {
      return false;
    }
    if (selectedLang !== 'all' && course.language.toLowerCase() !== selectedLang.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        course.title.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        course.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header & Filter Controls */}
      <div className="bg-white rounded-lg border border-slate-300 p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                OFFICIAL REPOSITORY
              </span>
              <span className="text-slate-300">|</span>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>iGOT Karmayogi Course Catalog (24 Modules)</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Statistics-specific courses mapped directly to MoSPI functional and domain competencies.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            {filteredCourses.length} of {courses.length} courses shown
          </span>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t.searchCourses}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            />
          </div>

          {/* Competency Filter */}
          <div>
            <select
              value={selectedComp}
              onChange={e => setSelectedComp(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="all">{t.allCompetencies}</option>
              {SEED_COMPETENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDiff}
              onChange={e => setSelectedDiff(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="all">{t.allDifficulties}</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={selectedLang}
              onChange={e => setSelectedLang(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="all">{t.allLanguages}</option>
              <option value="English">English</option>
              <option value="Hindi">हिंदी (Hindi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map(course => {
          const isCompleted = completedCourseIds.includes(course.id);

          return (
            <div
              key={course.id}
              className={`flex flex-col justify-between p-4.5 rounded-lg border bg-white transition-all shadow-[0_2px_6px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] ${
                isCompleted ? 'border-emerald-400 bg-emerald-50/15' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Meta line */}
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
                    <span>{course.duration_mins}m</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Competencies Covered with weights */}
                <div className="text-[11px] text-slate-600 mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-slate-700">Competencies:</span>
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
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <button
                  onClick={() => onToggleComplete(course.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
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

      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-300 p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center">
          <p className="text-sm font-semibold text-slate-700">No courses match your filter criteria.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedComp('all');
              setSelectedDiff('all');
              setSelectedLang('all');
            }}
            className="mt-2 text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
