import React, { useState } from 'react';
import {
  Users,
  Award,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  X,
  TrendingUp,
  BarChart3,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Competency, CompetencyCode, Course, User } from '../types/index.ts';
import { COMPETENCY_NAMES, COMPETENCY_ORDER } from '../server/scoring.ts';

interface AdminHeatmapProps {
  heatmapData: {
    departments: {
      code: string;
      name: string;
      learner_count: number;
      gaps: Record<CompetencyCode, number>;
      officials: {
        id: string;
        name: string;
        designation: string;
        gaps: Record<CompetencyCode, number>;
      }[];
    }[];
    competencies: Competency[];
    overall_averages: Record<CompetencyCode, number>;
  };
  courseEffectiveness: {
    course: Course;
    completions_count: number;
    avg_score_change: number;
    competency_names: string[];
  }[];
  suggestions: {
    competency_code: CompetencyCode;
    competency_name: string;
    avg_gap: number;
    existing_courses_count: number;
    priority: 'High' | 'Medium';
    recommendation: string;
  }[];
  summaryStats: {
    learner_count: number;
    quizzes_published: number;
    quiz_attempts_count: number;
    average_competency_gap: number;
    total_courses: number;
    materials_count: number;
  };
  onTriggerQuizGenForComp?: (code: CompetencyCode) => void;
}

export const AdminHeatmap: React.FC<AdminHeatmapProps> = ({
  heatmapData,
  courseEffectiveness,
  suggestions,
  summaryStats,
  onTriggerQuizGenForComp,
}) => {
  // Modal for cell click details
  const [selectedCell, setSelectedCell] = useState<{
    deptName: string;
    competencyCode: CompetencyCode;
    competencyName: string;
    avgGap: number;
    officials: { id: string; name: string; designation: string; gap: number }[];
  } | null>(null);

  // Heatmap color scale function
  const getCellColor = (gap: number) => {
    if (gap <= 0.2) return 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200';
    if (gap <= 0.8) return 'bg-emerald-100/70 text-emerald-900 hover:bg-emerald-200 border-emerald-300';
    if (gap <= 1.4) return 'bg-amber-100/80 text-amber-900 hover:bg-amber-200 border-amber-300';
    if (gap <= 2.0) return 'bg-orange-100 text-orange-950 hover:bg-orange-200 border-orange-300';
    return 'bg-red-100 text-red-950 hover:bg-red-200 border-red-300 font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Summary Tiles (PRD §4.6 F-53) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-300 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">MoSPI Officials</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {summaryStats?.learner_count ?? 12}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across 4 divisions</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-300 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Published Quizzes</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {summaryStats?.quizzes_published ?? 4}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">AI verified & approved</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-300 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Attempts</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {summaryStats?.quiz_attempts_count ?? 4}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Real-time score calibration</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-300 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Skill Gap</span>
            <BarChart3 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {summaryStats?.average_competency_gap ?? 1.15}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Scale 0.0 to 5.0</div>
        </div>
      </div>

      {/* Heatmap: Department × Competency (PRD §4.6 F-50) */}
      <div className="bg-white rounded-lg border border-slate-300 p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                AUDIT REGISTER
              </span>
              <span className="text-slate-300">|</span>
              <h2 className="text-base font-bold text-slate-900">
                Department × Competency Gap Heatmap
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Cell values indicate average measured gap (Target − Current). Click any cell to inspect individual cadre officials.
            </p>
          </div>

          {/* Color Scale Legend */}
          <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            <span>Low Gap</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-3 bg-emerald-100 border border-emerald-300 rounded-2xs inline-block"></span>
              <span className="w-4 h-3 bg-amber-100 border border-amber-300 rounded-2xs inline-block"></span>
              <span className="w-4 h-3 bg-orange-100 border border-orange-300 rounded-2xs inline-block"></span>
              <span className="w-4 h-3 bg-red-100 border border-red-300 rounded-2xs inline-block"></span>
            </div>
            <span>High Gap (≥2.0)</span>
          </div>
        </div>

        {/* Mobile Swipe Indicator */}
        <div className="text-[11px] text-slate-500 mb-2 flex items-center justify-between sm:hidden px-1">
          <span className="flex items-center gap-1 text-blue-900 font-semibold">
            <span>← Swipe horizontally to audit all 7 competencies →</span>
          </span>
        </div>

        {/* Heatmap Table */}
        <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
          <table className="w-full text-xs text-left min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50">
                <th className="py-2.5 px-3 font-bold text-slate-800 min-w-[180px] sm:min-w-[200px] sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.03)] sm:shadow-none">
                  Division / Directorate
                </th>
                <th className="py-2.5 px-2 text-center text-slate-600 font-semibold">
                  Cadre Count
                </th>
                {COMPETENCY_ORDER.map(code => (
                  <th key={code} className="py-2.5 px-2 text-center font-bold text-slate-700">
                    <div>{code}</div>
                    <div className="text-[9px] font-normal text-slate-400 capitalize">
                      {COMPETENCY_NAMES[code].split(' ')[0]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {heatmapData.departments.map(dept => (
                <tr key={dept.code} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.03)] sm:shadow-none">
                    <div className="font-bold text-slate-900">{dept.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{dept.code}</div>
                  </td>
                  <td className="py-3 px-2 text-center text-slate-600 font-semibold">
                    {dept.learner_count}
                  </td>
                  {COMPETENCY_ORDER.map(code => {
                    const gap = dept.gaps[code] ?? 0;
                    const cellColor = getCellColor(gap);

                    return (
                      <td key={code} className="py-2 px-1.5 text-center">
                        <button
                          onClick={() => {
                            const officialsForCell = dept.officials.map(o => ({
                              id: o.id,
                              name: o.name,
                              designation: o.designation,
                              gap: o.gaps[code] ?? 0,
                            }));
                            setSelectedCell({
                              deptName: dept.name,
                              competencyCode: code,
                              competencyName: COMPETENCY_NAMES[code],
                              avgGap: gap,
                              officials: officialsForCell,
                            });
                          }}
                          className={`w-full py-1.5 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${cellColor}`}
                          title={`Click to view officials in ${dept.name} for ${code}`}
                        >
                          {gap.toFixed(1)}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Overall Averages Row */}
              <tr className="bg-slate-100/70 font-bold border-t-2 border-slate-300">
                <td className="py-3 px-3 text-slate-900 sticky left-0 bg-slate-100 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.03)] sm:shadow-none">
                  National Average Gap Across Cadres
                </td>
                <td className="py-3 px-2 text-center text-slate-700">
                  {summaryStats?.learner_count ?? 12}
                </td>
                {COMPETENCY_ORDER.map(code => {
                  const avg = heatmapData.overall_averages[code] ?? 0;
                  return (
                    <td key={code} className="py-2 px-1.5 text-center">
                      <span className="inline-block py-1 px-2 rounded bg-white border border-slate-300 text-slate-900 text-xs font-extrabold">
                        {avg.toFixed(1)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggested New Courses (PRD §4.6 F-52) */}
      <div className="bg-white rounded-lg border border-slate-300 p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900">
            Suggested Capacity Interventions (PRD §4.6 F-52)
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Competency clusters where department average gap is high (≥1.0) and few targeted iGOT courses exist.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {suggestions.map(s => (
            <div
              key={s.competency_code}
              className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 shadow-[0_2px_6px_rgba(0,0,0,0.04)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-900 font-bold">
                    {s.competency_name} ({s.competency_code})
                  </span>
                  <span className="text-[10px] uppercase font-bold text-red-700 bg-red-100 px-1.5 py-0.2 rounded">
                    {s.priority} Priority
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mb-2">
                  Average Gap: <strong className="text-amber-800">{s.avg_gap.toFixed(1)}</strong> ·{' '}
                  Catalog: {s.existing_courses_count} courses
                </div>
                <p className="text-xs text-slate-700 leading-relaxed mb-3">
                  {s.recommendation}
                </p>
              </div>

              {onTriggerQuizGenForComp && (
                <button
                  onClick={() => onTriggerQuizGenForComp(s.competency_code)}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
                >
                  <span>Author Diagnostic Assessment</span>
                  <ArrowRight className="w-3 h-3 text-amber-300" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Course Effectiveness Table (PRD §4.6 F-51) */}
      <div className="bg-white rounded-lg border border-slate-300 p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="pb-2 mb-3 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">
            Course Effectiveness & Skill Lift (PRD §4.6 F-51)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tracks completions count and empirical competency score uplift (pre vs post) for completed modules.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50">
                <th className="py-2.5 px-3 font-semibold text-slate-700">Course ID & Title</th>
                <th className="py-2.5 px-2">Covered Competencies</th>
                <th className="py-2.5 px-2 text-center">Difficulty</th>
                <th className="py-2.5 px-2 text-center">Completions</th>
                <th className="py-2.5 px-3 text-right">Avg Score Lift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courseEffectiveness.slice(0, 8).map(item => (
                <tr key={item.course.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900">{item.course.id}</span>
                    <span className="text-slate-400 mx-1">·</span>
                    <span className="font-medium text-slate-800">{item.course.title}</span>
                  </td>
                  <td className="py-2.5 px-2 text-slate-600">
                    {item.competency_names.join(', ')}
                  </td>
                  <td className="py-2.5 px-2 text-center capitalize text-slate-600">
                    {item.course.difficulty}
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-slate-800">
                    {item.completions_count} officials
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`font-bold ${
                        item.avg_score_change > 0 ? 'text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      {item.avg_score_change > 0
                        ? `+${item.avg_score_change.toFixed(1)} pts`
                        : 'Calibrating'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Cell Details for Inspecting Officials */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-lg w-full p-4 sm:p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Cadre Breakdown
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedCell.competencyName} ({selectedCell.competencyCode})
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedCell.deptName} · Average Gap: {selectedCell.avgGap.toFixed(1)}
                </p>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
              {selectedCell.officials.map(o => (
                <div key={o.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{o.name}</div>
                    <div className="text-[11px] text-slate-500">{o.designation}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-xs ${
                        o.gap > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {o.gap > 0 ? `Gap: -${o.gap.toFixed(1)}` : 'Target Met'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
