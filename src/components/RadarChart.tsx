import React, { useState } from 'react';
import { CompetencyGapItem } from '../types/index.ts';
import { Language, TRANSLATIONS } from '../utils/i18n.ts';
import { Table, Eye, Info } from 'lucide-react';

interface RadarChartProps {
  items: CompetencyGapItem[];
  lang: Language;
  onSelectCompetency?: (code: string) => void;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  items,
  lang,
  onSelectCompetency,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<CompetencyGapItem | null>(null);
  const [showTable, setShowTable] = useState(false);
  const t = TRANSLATIONS[lang];

  // SVG dimensions tuned for perfect responsive scaling on mobile & tablet
  const size = 400;
  const center = size / 2;
  const radius = 120;
  const levels = 5;

  const numAxes = items.length;
  const angleStep = (2 * Math.PI) / numAxes;

  // Compute coordinate on radar
  const getCoordinates = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 5) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon points
  const targetPoints = items
    .map((item, idx) => {
      const { x, y } = getCoordinates(idx, item.target);
      return `${x},${y}`;
    })
    .join(' ');

  const currentPoints = items
    .map((item, idx) => {
      const { x, y } = getCoordinates(idx, item.current);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white rounded-lg border border-slate-300 p-4 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              FORM STAT-7A
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-500 font-mono">Dossier: MoSPI/FRAC/2026</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
            <span>{t.radarTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'hi'
              ? 'आधिकारिक पद लक्ष्यों के विरुद्ध 7-अक्षीय क्षमता अंतर मूल्यांकन (नियम आधारित)'
              : 'Statistical Cadre Competency Evaluation vs. Official Role Targets (Deterministic §6.1)'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Legend */}
          <div className="flex items-center gap-2.5 text-xs bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#2563eb] rounded-sm inline-block"></span>
              <span className="font-bold text-slate-800 text-[11px]">Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 border-b-2 border-dashed border-[#d97706] inline-block"></span>
              <span className="font-semibold text-slate-700 text-[11px]">Target</span>
            </div>
          </div>

          <button
            onClick={() => setShowTable(!showTable)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors cursor-pointer"
            title="Toggle accessible table"
          >
            <Table className="w-3.5 h-3.5" />
            <span>{showTable ? 'Hide Table' : 'Table (अनुसूची)'}</span>
          </button>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative flex flex-col justify-center items-center py-1">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[340px] sm:max-w-[390px] h-auto select-none mx-auto overflow-visible"
        >
          {/* Background concentric rings */}
          {Array.from({ length: levels }).map((_, i) => {
            const levelRadius = ((i + 1) / levels) * radius;
            return (
              <circle
                key={`ring-${i}`}
                cx={center}
                cy={center}
                r={levelRadius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray={i === levels - 1 ? 'none' : '3 3'}
              />
            );
          })}

          {/* Scale labels (1 to 5) */}
          {Array.from({ length: levels }).map((_, i) => {
            const val = i + 1;
            const y = center - (val / 5) * radius;
            return (
              <text
                key={`scale-${val}`}
                x={center + 4}
                y={y + 3}
                fill="#94a3b8"
                fontSize="9"
                fontWeight="500"
              >
                {val}
              </text>
            );
          })}

          {/* Axis spoke lines */}
          {items.map((item, idx) => {
            const { x, y } = getCoordinates(idx, 5);
            return (
              <line
                key={`axis-${item.code}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
            );
          })}

          {/* Role Target Polygon */}
          <polygon
            points={targetPoints}
            fill="#fef3c7"
            fillOpacity="0.25"
            stroke="#d97706"
            strokeWidth="2"
            strokeDasharray="4 3"
          />

          {/* Current Score Polygon */}
          <polygon
            points={currentPoints}
            fill="#dbeafe"
            fillOpacity="0.45"
            stroke="#2563eb"
            strokeWidth="2.5"
          />

          {/* Target points */}
          {items.map((item, idx) => {
            const { x, y } = getCoordinates(idx, item.target);
            return (
              <circle
                key={`tgt-pt-${item.code}`}
                cx={x}
                cy={y}
                r="3"
                fill="#d97706"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Current score clickable points */}
          {items.map((item, idx) => {
            const { x, y } = getCoordinates(idx, item.current);
            const isHovered = activeTooltip?.code === item.code;
            return (
              <g
                key={`cur-pt-${item.code}`}
                className="cursor-pointer transition-transform hover:scale-125"
                onMouseEnter={() => setActiveTooltip(item)}
                onMouseLeave={() => setActiveTooltip(null)}
                onClick={() => {
                  setActiveTooltip(activeTooltip?.code === item.code ? null : item);
                  onSelectCompetency?.(item.code);
                }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4.5}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Outer Axis Labels */}
          {items.map((item, idx) => {
            const angle = idx * angleStep - Math.PI / 2;
            const labelRadius = radius + 22;
            const lx = center + labelRadius * Math.cos(angle);
            const ly = center + labelRadius * Math.sin(angle);

            let textAnchor: 'middle' | 'start' | 'end' = 'middle';
            if (Math.cos(angle) > 0.3) textAnchor = 'start';
            else if (Math.cos(angle) < -0.3) textAnchor = 'end';

            const hasGap = item.gap > 0;
            const isSelected = activeTooltip?.code === item.code;

            return (
              <g
                key={`label-${item.code}`}
                className="cursor-pointer"
                onClick={() => {
                  setActiveTooltip(activeTooltip?.code === item.code ? null : item);
                  onSelectCompetency?.(item.code);
                }}
                onMouseEnter={() => setActiveTooltip(item)}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <text
                  x={lx}
                  y={ly - 4}
                  textAnchor={textAnchor}
                  fill={isSelected ? '#1d4ed8' : '#0f172a'}
                  fontSize={isSelected ? '12' : '11'}
                  fontWeight="700"
                >
                  {item.code}
                </text>
                <text
                  x={lx}
                  y={ly + 8}
                  textAnchor={textAnchor}
                  fill={hasGap ? '#b45309' : '#059669'}
                  fontSize="9.5"
                  fontWeight="600"
                >
                  {item.current} / {item.target}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover / Click Info Tooltip Overlay (Desktop & Tablet) */}
        {activeTooltip && (
          <div className="hidden sm:block absolute top-2 right-2 bg-slate-900 text-white rounded-lg p-3 text-xs shadow-lg border border-slate-700 pointer-events-none max-w-[210px] animate-in fade-in duration-100 z-10">
            <div className="font-bold text-sm text-amber-300">
              {activeTooltip.name} ({activeTooltip.code})
            </div>
            <div className="text-[10px] text-slate-300 uppercase tracking-wider mb-2">
              FRAC: {activeTooltip.frac_type}
            </div>

            <div className="space-y-1 border-t border-slate-700 pt-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Score:</span>
                <span className="font-bold text-white">{activeTooltip.current} / 5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Role Target:</span>
                <span className="font-semibold text-amber-400">{activeTooltip.target} / 5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Measured Gap:</span>
                <span className={`font-bold ${activeTooltip.gap > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {activeTooltip.gap > 0 ? `-${activeTooltip.gap}` : 'Target Met'}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Quiz accuracy:</span>
                <span>
                  {activeTooltip.n_questions > 0
                    ? `${activeTooltip.n_correct}/${activeTooltip.n_questions} (${Math.round(
                        (activeTooltip.n_correct / activeTooltip.n_questions) * 100
                      )}%)`
                    : 'No quiz taken'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Dedicated Competency Detail Card (Visible on mobile when tapped) */}
        {activeTooltip ? (
          <div className="sm:hidden w-full mt-3 p-3 bg-slate-900 text-white rounded-lg border border-slate-700 text-xs shadow-md animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-1">
              <div className="font-bold text-sm text-amber-300">
                {activeTooltip.name} ({activeTooltip.code})
              </div>
              <button
                onClick={() => setActiveTooltip(null)}
                className="text-slate-400 hover:text-white text-[10px] px-1.5 py-0.5 rounded bg-slate-800"
              >
                ✕ Close
              </button>
            </div>
            <div className="text-[10px] text-slate-300 mb-2">
              FRAC Type: <strong>{activeTooltip.frac_type}</strong>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-2 rounded text-center mb-2">
              <div>
                <div className="text-[10px] text-slate-400">Current</div>
                <div className="font-bold text-blue-300 text-sm">{activeTooltip.current}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Target</div>
                <div className="font-bold text-amber-300 text-sm">{activeTooltip.target}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Gap</div>
                <div className={`font-bold text-sm ${activeTooltip.gap > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {activeTooltip.gap > 0 ? `-${activeTooltip.gap}` : '0.0'}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>Quiz Questions Answered:</span>
              <strong className="text-white">
                {activeTooltip.n_questions > 0
                  ? `${activeTooltip.n_correct} / ${activeTooltip.n_questions} (${Math.round(
                      (activeTooltip.n_correct / activeTooltip.n_questions) * 100
                    )}%)`
                  : 'None yet'}
              </strong>
            </div>
          </div>
        ) : (
          <div className="sm:hidden text-center text-[11px] text-slate-500 mt-1 flex items-center justify-center gap-1">
            <Info className="w-3 h-3 text-slate-400" />
            <span>Tap any competency vertex to inspect gap & score details</span>
          </div>
        )}
      </div>

      {/* Accessible Data Table (PRD §12 Accessibility requirement) */}
      {showTable && (
        <div className="mt-4 pt-4 border-t border-slate-200 overflow-x-auto">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>अनुसूची 1: सांख्यिकी क्षमता प्राप्तांक विवरण (Schedule 1: Competency Register)</span>
            <span className="font-mono text-slate-500 font-normal">Scale: 1.00 (Novice) to 5.00 (Expert)</span>
          </div>
          <table className="w-full text-xs text-left text-slate-700 border border-slate-300">
            <thead className="bg-[#f1f5f9] text-slate-800 font-bold border-b border-slate-300 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-2 text-center border-r border-slate-300">क्र.सं. / Sl.</th>
                <th className="py-2.5 px-3 border-r border-slate-300">क्षमता / Competency Code & Title</th>
                <th className="py-2.5 px-2 border-r border-slate-300">FRAC Type</th>
                <th className="py-2.5 px-2 text-center border-r border-slate-300">Self-Rating</th>
                <th className="py-2.5 px-2 text-center border-r border-slate-300">CBT Questions</th>
                <th className="py-2.5 px-2 text-center border-r border-slate-300 font-bold text-blue-900 bg-blue-50/60">Current</th>
                <th className="py-2.5 px-2 text-center border-r border-slate-300 font-bold text-amber-900 bg-amber-50/60">Cadre Target</th>
                <th className="py-2.5 px-2 text-center font-bold">Measured Gap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, idx) => (
                <tr key={item.code} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-2 text-center font-mono text-slate-500 border-r border-slate-200">
                    0{idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-200">
                    <span className="font-bold text-blue-950">{item.code}</span>
                    <span className="text-slate-400 mx-1">·</span>
                    <span>{item.name}</span>
                  </td>
                  <td className="py-2.5 px-2 text-slate-600 border-r border-slate-200">{item.frac_type}</td>
                  <td className="py-2.5 px-2 text-center border-r border-slate-200">{item.self.toFixed(1)}</td>
                  <td className="py-2.5 px-2 text-center text-slate-600 border-r border-slate-200">
                    {item.n_questions > 0 ? `${item.n_correct}/${item.n_questions} q` : 'Nil'}
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-blue-900 bg-blue-50/30 border-r border-slate-200">
                    {item.current.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-2 text-center font-bold text-amber-900 bg-amber-50/30 border-r border-slate-200">
                    {item.target}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        item.gap > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {item.gap > 0 ? `-${item.gap.toFixed(1)}` : '0.0 (Target Met)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
