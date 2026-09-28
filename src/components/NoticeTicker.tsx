import React from 'react';
import { Bell, ChevronRight, FileText } from 'lucide-react';

interface NoticeTickerProps {
  lang: 'en' | 'hi';
}

export const NoticeTicker: React.FC<NoticeTickerProps> = ({ lang }) => {
  return (
    <div className="bg-[#fff9e6] border-b border-[#f0dfa8] text-xs text-slate-800 py-1.5 px-4 flex items-center gap-3 overflow-hidden shadow-2xs">
      <div className="flex items-center gap-1.5 shrink-0 bg-[#b45309] text-white px-2 py-0.5 rounded-2xs font-bold text-[10px] uppercase tracking-wider">
        <Bell className="w-3 h-3 text-amber-200 animate-pulse" />
        <span>{lang === 'hi' ? 'राजपत्र सूचना' : 'Official Notice'}</span>
      </div>

      <div className="flex-1 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee font-medium text-slate-700">
          <span className="font-semibold text-slate-900">
            {lang === 'hi'
              ? 'अधिसूचना सं. 14/2026-MoSPI: '
              : 'Notification No. 14/2026-MoSPI: '}
          </span>
          {lang === 'hi'
            ? 'मिशन कर्मयोगी राष्ट्रीय प्रशिक्षण नीति के तहत सांख्यिकी संवर्ग क्षमता अंतराल मूल्यांकन चक्र 2026-27 सक्रिय है। सभी एनएसओ, एनएसएस (एफओडी), राज्य डीईएस और डीपीडी अधिकारी अपने पद लक्ष्यों की समीक्षा करें।'
            : 'Statistical Cadre Competency Gap Assessment Cycle 2026-27 is active under Mission Karmayogi. Officials across NSO, NSS (FOD), State DES, and DPD must verify their cadre benchmarks.'}
          <span className="mx-4 text-slate-400">|</span>
          <span className="font-semibold text-blue-900">
            {lang === 'hi' ? 'आईगॉट एकीकरण: ' : 'iGOT Integration: '}
          </span>
          {lang === 'hi'
            ? '24 आधिकारिक ई-लर्निंग मॉड्यूल एवं एआई-आधारित स्वतः प्रश्नोत्तरी प्रणाली उपलब्ध।'
            : '24 certified e-learning courses and AI-enabled auto-quiz generation active for Training Cell Officers.'}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 shrink-0 text-[11px] text-blue-900 font-semibold hover:underline cursor-pointer">
        <FileText className="w-3 h-3 text-blue-700" />
        <span>{lang === 'hi' ? 'परिपत्र देखें' : 'View Circular'}</span>
      </div>
    </div>
  );
};
