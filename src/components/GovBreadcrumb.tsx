import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Language } from '../utils/i18n.ts';

interface GovBreadcrumbProps {
  activeTab: string;
  lang: Language;
  onNavigateHome: () => void;
}

export const GovBreadcrumb: React.FC<GovBreadcrumbProps> = ({
  activeTab,
  lang,
  onNavigateHome,
}) => {
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return lang === 'hi' ? 'क्षमता इंटेलिजेंस डैशबोर्ड' : 'Cadre Competency Intelligence';
      case 'quizzes':
        return lang === 'hi' ? 'प्रश्नोत्तरी एवं आकलन (CBT)' : 'CBT Assessments & Quizzes';
      case 'catalog':
        return lang === 'hi' ? 'आईगॉट पाठ्यक्रम सूची (24 मॉड्यूल)' : 'iGOT Course Catalog (24 Modules)';
      case 'advisor':
        return lang === 'hi' ? 'एआई पाठ्यक्रम सलाहकार' : 'AI Course Advisor (RAG)';
      case 'analytics':
        return lang === 'hi' ? 'विभागीय ऑडिट एवं हीटमैप' : 'Departmental Audit & Gap Heatmap';
      case 'generator':
        return lang === 'hi' ? 'एआई स्वतः प्रश्नोत्तरी जनरेटर' : 'AI Assessment Generator';
      default:
        return tab;
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 py-1.5 px-4 sm:px-8 text-[11px] text-slate-500 flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-2xs">
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-1 text-slate-600 hover:text-blue-900 transition-colors cursor-pointer shrink-0 font-medium"
      >
        <Home className="w-3 h-3 text-slate-400" />
        <span>{lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
      </button>

      <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />

      <span className="shrink-0 text-slate-600">
        {lang === 'hi' ? 'सांख्यिकी मंत्रालय (MoSPI)' : 'MoSPI'}
      </span>

      <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />

      <span className="shrink-0 text-slate-600">
        {lang === 'hi' ? 'मिशन कर्मयोगी' : 'Mission Karmayogi'}
      </span>

      <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />

      <span className="shrink-0 font-bold text-[#0B2545]">
        {getTabLabel(activeTab)}
      </span>
    </div>
  );
};
