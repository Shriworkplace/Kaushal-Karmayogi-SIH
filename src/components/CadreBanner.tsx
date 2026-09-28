import React from 'react';
import { User } from '../types/index.ts';
import { ShieldCheck, Award, Calendar, Hash, Building2, UserCheck } from 'lucide-react';
import { Language } from '../utils/i18n.ts';

interface CadreBannerProps {
  user: User;
  lang: Language;
}

export const CadreBanner: React.FC<CadreBannerProps> = ({ user, lang }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-300 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] relative overflow-hidden">
      {/* Decorative Government Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-[#0B2545] to-[#138808]" />

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0B2545] text-white flex items-center justify-center font-bold text-lg border-2 border-amber-400 shadow-2xs shrink-0">
            {user.name.charAt(0)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {lang === 'hi' ? 'सत्यापित सांख्यिकी संवर्ग' : 'Verified Statistical Cadre'}
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-[11px] font-mono text-slate-500">
                REF: MoSPI/2026/{user.department}-{user.id.slice(-4).toUpperCase()}
              </span>
            </div>

            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {user.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-0.5">
              <span className="font-semibold text-[#0B2545]">{user.designation}</span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span>{user.department}</span>
              </span>
              <span className="text-slate-300">|</span>
              <span>{user.years_experience} Years Service</span>
            </div>
          </div>
        </div>

        {/* Official Status Stamp */}
        <div className="w-full sm:w-auto flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 sm:px-3.5 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'hi' ? 'प्रमाणीकरण स्तर' : 'iGOT FRAC Standard'}
            </div>
            <div className="text-xs font-bold text-slate-900">
              {lang === 'hi' ? 'मिशन कर्मयोगी संवर्ग 2026' : 'Mission Karmayogi 2026'}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold">
              7 Statistical Competencies Mapped
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
