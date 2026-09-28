import React, { useState } from 'react';
import {
  User,
  ChevronDown,
  UserPlus,
  RefreshCw,
  Globe,
  HelpCircle,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  FileText,
  Eye,
  Sliders,
} from 'lucide-react';
import { User as UserType } from '../types/index.ts';
import { Language, TRANSLATIONS } from '../utils/i18n.ts';
import { AshokaEmblem } from './AshokaEmblem.tsx';
import { NoticeTicker } from './NoticeTicker.tsx';

interface HeaderProps {
  currentUser: UserType | null;
  allUsers: UserType[];
  onSwitchUser: (userId: string) => void;
  onOpenOnboarding: () => void;
  onOpenFormulaModal: () => void;
  onResetData: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  lang: Language;
  onToggleLang: () => void;
  fontSizeLevel: number;
  onChangeFontSize: (delta: number) => void;
  contrastMode: boolean;
  onToggleContrast: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenOnboarding,
  onOpenFormulaModal,
  onResetData,
  activeTab,
  onTabChange,
  lang,
  onToggleLang,
  fontSizeLevel,
  onChangeFontSize,
  contrastMode,
  onToggleContrast,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const t = TRANSLATIONS[lang];
  const isLearner = currentUser?.role === 'learner';

  const learners = allUsers.filter(u => u.role === 'learner');
  const admins = allUsers.filter(u => u.role === 'admin');

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-300 shadow-sm">
      {/* 1. National Tricolor Strip */}
      <div className="flex h-1.5 w-full">
        <div className="bg-[#FF9933] flex-1" />
        <div className="bg-[#FFFFFF] flex-1 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full border border-[#000080]" />
        </div>
        <div className="bg-[#138808] flex-1" />
      </div>

      {/* 2. Official Top Accessibility & Citizen Service Bar */}
      <div className="bg-[#1e293b] text-slate-200 text-[11px] px-3 sm:px-8 py-1.5 flex flex-wrap items-center justify-between gap-y-1.5 border-b border-slate-700">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Skip to Main Content accessible link */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-1 focus:left-2 focus:z-50 focus:px-3 focus:py-1 focus:bg-amber-400 focus:text-slate-900 focus:font-bold focus:rounded text-xs shadow-md"
          >
            {lang === 'hi' ? 'मुख्य सामग्री पर जाएं' : 'Skip to Main Content'}
          </a>
          <span className="font-semibold text-white tracking-wide text-[10px] sm:text-[11px]">
            {lang === 'hi' ? 'भारत सरकार' : 'GOVERNMENT OF INDIA'}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 text-[10px] sm:text-[11px] hidden sm:inline">
            {lang === 'hi' ? 'सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय' : 'Ministry of Statistics & Programme Implementation'}
          </span>
          <span className="text-slate-500 hidden lg:inline">|</span>
          <a
            href="#main-content"
            className="text-slate-300 hover:text-white underline decoration-slate-500 text-[10px] hidden lg:inline"
          >
            {lang === 'hi' ? 'मुख्य सामग्री' : 'Skip to main content'}
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-slate-300">
          {/* Screen Reader & Text Sizing (accessible on all screen sizes) */}
          <div className="flex items-center gap-1 border-r border-slate-600 pr-2">
            <span className="text-[9px] text-slate-400 hidden xs:inline">Font:</span>
            <button
              onClick={() => onChangeFontSize(-1)}
              className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded text-[9px] font-bold text-white transition-colors cursor-pointer"
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => onChangeFontSize(0)}
              className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded text-[9px] font-bold text-white transition-colors cursor-pointer"
              title="Default Font Size"
            >
              A
            </button>
            <button
              onClick={() => onChangeFontSize(1)}
              className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded text-[9px] font-bold text-white transition-colors cursor-pointer"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={onToggleContrast}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer p-1"
            title="Toggle High Contrast"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">
              {contrastMode ? 'Standard' : 'Contrast'}
            </span>
          </button>

          {/* Bilingual Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 font-bold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer border-l border-slate-600 pl-2 sm:pl-3"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-[11px]">{lang === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Scoring Formula Explainer */}
          <button
            onClick={onOpenFormulaModal}
            className="flex items-center gap-1 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer hidden md:flex"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.howCalculated}</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetData}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Reset seed data"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden lg:inline">{t.resetDemo}</span>
          </button>
        </div>
      </div>

      {/* 3. Official Ministry Branding Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left: Ashoka Lion Capital & Official Typography */}
          <div className="flex items-center gap-3.5">
            <AshokaEmblem className="w-10 sm:w-12 h-14 sm:h-16 text-[#8B4513] shrink-0" color="#8B4513" />

            <div className="border-l-2 border-slate-300 pl-3 sm:pl-4">
              <div className="text-[12px] sm:text-[14px] font-bold text-slate-900 leading-tight">
                सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय
              </div>
              <div className="text-[13px] sm:text-[16px] font-extrabold text-[#0B2545] tracking-tight leading-tight uppercase font-serif">
                Ministry of Statistics and Programme Implementation
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 font-medium flex items-center gap-2 mt-0.5">
                <span>राष्ट्रीय सांख्यिकी कार्यालय (NSO)</span>
                <span>·</span>
                <span>National Statistical Office</span>
              </div>
            </div>
          </div>

          {/* Center-Right: Mission Karmayogi & iGOT Insignia & Parichay ID Card */}
          <div className="flex items-center gap-4">
            {/* Mission Karmayogi Official Badge */}
            <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#B45309] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                कर्म
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider">
                  मिशन कर्मयोगी
                </div>
                <div className="text-[11px] font-extrabold text-slate-800 leading-tight">
                  iGOT Karmayogi Layer
                </div>
                <div className="text-[9px] text-slate-500">
                  SIH26101 · Competency AI
                </div>
              </div>
            </div>

            {/* Parichay SSO Official Identity Badge / Cadre Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#f8fafc] border border-slate-300 hover:border-blue-600 hover:bg-blue-50/40 transition-all text-left cursor-pointer shadow-2xs"
                title="Mock Parichay SSO Cadre Switcher"
              >
                <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 border-2 border-slate-300">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {currentUser?.name || 'MoSPI Official'}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        currentUser?.role === 'admin'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      {currentUser?.role === 'admin' ? 'Training Cell' : 'Cadre Official'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 leading-tight flex items-center gap-1 mt-0.5">
                    <span className="font-semibold text-blue-900">{currentUser?.designation}</span>
                    <span>·</span>
                    <span className="font-mono text-slate-500">{currentUser?.department}</span>
                  </div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
              </button>

              {/* Parichay SSO Switcher Dropdown */}
              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-88 max-w-sm bg-white rounded-xl shadow-2xl border border-slate-300 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 bg-[#0B2545] text-white rounded-t-lg -mt-2 mb-2">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          {t.ssoLabel}
                        </div>
                        <span className="text-[9px] bg-amber-400 text-slate-900 font-bold px-1.5 py-0.2 rounded">
                          SSO AUTHENTICATED
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-white mt-1">
                        Select MoSPI Cadre Official / Training Administrator
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto px-2 divide-y divide-slate-100">
                      {/* Admins */}
                      <div className="py-1">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Central Training Cell Admins
                        </div>
                        {admins.map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSwitchUser(u.id);
                              setUserDropdownOpen(false);
                            }}
                            className={`w-full px-2.5 py-2 text-left rounded-lg flex items-center gap-2.5 hover:bg-slate-100 transition-colors cursor-pointer ${
                              u.id === currentUser?.id ? 'bg-purple-50 border border-purple-200' : ''
                            }`}
                          >
                            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900">{u.name}</p>
                              <p className="text-[11px] text-slate-500">
                                {u.designation} · {u.department} (Admin)
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Cadre Learners */}
                      <div className="py-1">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          MoSPI Cadre Officials (Field & Analysis Cadres)
                        </div>
                        {learners.map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSwitchUser(u.id);
                              setUserDropdownOpen(false);
                            }}
                            className={`w-full px-2.5 py-2 text-left rounded-lg flex items-center gap-2.5 hover:bg-slate-100 transition-colors cursor-pointer ${
                              u.id === currentUser?.id ? 'bg-blue-50 border border-blue-200' : ''
                            }`}
                          >
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900">{u.name}</p>
                              <p className="text-[11px] text-slate-500">
                                {u.designation} · {u.department} ({u.years_experience} yrs exp)
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-2 px-3 mt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenOnboarding();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-[#0B2545] hover:bg-[#13315C] rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        <UserPlus className="w-4 h-4 text-amber-400" />
                        <span>{t.newOfficial}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Official Government Portal Navigation Bar */}
      <nav className="bg-[#0B2545] text-white border-b-2 border-[#B45309] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <div className="flex overflow-x-auto space-x-1 sm:space-x-2 py-1 no-scrollbar text-xs sm:text-sm font-semibold">
            {isLearner ? (
              <>
                <button
                  onClick={() => onTabChange('dashboard')}
                  className={`px-3.5 py-2 rounded-t-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'dashboard'
                      ? 'bg-white text-[#0B2545] font-bold shadow-xs'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{t.dashboard}</span>
                </button>
                <button
                  onClick={() => onTabChange('quizzes')}
                  className={`px-3.5 py-2 rounded-t-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'quizzes'
                      ? 'bg-white text-[#0B2545] font-bold shadow-xs'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{t.assessments}</span>
                </button>
                <button
                  onClick={() => onTabChange('catalog')}
                  className={`px-3.5 py-2 rounded-t-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'catalog'
                      ? 'bg-white text-[#0B2545] font-bold shadow-xs'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{t.catalog}</span>
                </button>
                <button
                  onClick={() => onTabChange('advisor')}
                  className={`px-3.5 py-2 rounded-t-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'advisor'
                      ? 'bg-white text-[#0B2545] font-bold shadow-xs'
                      : 'text-amber-300 hover:text-amber-200 hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.advisor}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onTabChange('analytics')}
                  className={`px-3.5 py-2 rounded-t-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'analytics'
                      ? 'bg-white text-[#0B2545] font-bold shadow-xs'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{t.analytics}</span>
                </button>
                <button
                  onClick={() => onTabChange('generator')}
                  className={`px-3.5 py-2 rounded-t-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'generator'
                      ? 'bg-white text-[#0B2545] font-bold shadow-xs'
                      : 'text-amber-300 hover:text-amber-200 hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.generator}</span>
                </button>
                <button
                  onClick={() => onTabChange('quizzes')}
                  className={`px-3.5 py-2 rounded-t-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'quizzes'
                      ? 'bg-white text-[#0B2545] font-bold shadow-xs'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{t.management}</span>
                </button>
                <button
                  onClick={() => onTabChange('catalog')}
                  className={`px-3.5 py-2 rounded-t-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'catalog'
                      ? 'bg-white text-[#0B2545] font-bold shadow-xs'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{t.catalog}</span>
                </button>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-amber-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Portal Status: Official & Operational</span>
          </div>
        </div>
      </nav>

      {/* 5. Official Circular / Notice Ticker */}
      <NoticeTicker lang={lang} />
    </header>
  );
};
