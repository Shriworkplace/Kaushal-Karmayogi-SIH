import React from 'react';
import { AshokaEmblem } from './AshokaEmblem.tsx';
import { ShieldCheck, ExternalLink, Globe } from 'lucide-react';
import { Language } from '../utils/i18n.ts';

interface GovFooterProps {
  lang: Language;
  onOpenFormula: () => void;
  onResetData: () => void;
}

export const GovFooter: React.FC<GovFooterProps> = ({
  lang,
  onOpenFormula,
  onResetData,
}) => {
  return (
    <footer className="bg-[#0B2545] text-slate-300 border-t-4 border-[#B45309] mt-12 text-xs">
      {/* Upper Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 border-b border-slate-700/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Column 1: Ministry Profile */}
          <div className="sm:col-span-2 space-y-3">
            <div className="flex items-start gap-3">
              <AshokaEmblem className="w-9 h-12 text-amber-400 shrink-0" color="#FBBF24" />
              <div>
                <div className="text-white font-extrabold text-sm sm:text-base leading-snug">
                  सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय
                </div>
                <div className="text-amber-300 font-bold text-xs uppercase tracking-wide">
                  Ministry of Statistics & Programme Implementation
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Government of India · भारत सरकार
                </div>
              </div>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed max-w-md pt-1">
              {lang === 'hi'
                ? 'कौशल कर्मयोगी: मिशन कर्मयोगी के अंतर्गत सांख्यिकी अधिकारियों के लिए क्षमता अंतराल पहचान, अनुकूलित पाठ्यक्रम अनुशंसा एवं एआई-आधारित स्वतः प्रश्नोत्तरी प्रणाली।'
                : 'Kaushal Karmayogi: AI-enabled competency gap intelligence, personalized iGOT curriculum recommendations, and automated assessment generation for MoSPI statistical cadres under Mission Karmayogi.'}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 rounded text-[10px] font-semibold text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>GIGW 3.0 Certified</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 rounded text-[10px] font-semibold text-slate-200">
                <span>W3C WCAG 2.1 AA</span>
              </span>
            </div>
          </div>

          {/* Column 2: Official Mandatory Policies */}
          <div className="space-y-2">
            <div className="text-white font-bold text-xs uppercase tracking-wider border-b border-slate-700 pb-1.5 text-amber-300">
              {lang === 'hi' ? 'महत्वपूर्ण नीतियां' : 'Mandatory Policies'}
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              <li>
                <a href="#terms" onClick={e => e.preventDefault()} className="hover:text-white hover:underline">
                  {lang === 'hi' ? 'नियम और शर्तें' : 'Terms & Conditions'}
                </a>
              </li>
              <li>
                <a href="#privacy" onClick={e => e.preventDefault()} className="hover:text-white hover:underline">
                  {lang === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
                </a>
              </li>
              <li>
                <a href="#copyright" onClick={e => e.preventDefault()} className="hover:text-white hover:underline">
                  {lang === 'hi' ? 'कॉपीराइट नीति' : 'Copyright Policy'}
                </a>
              </li>
              <li>
                <a href="#hyperlink" onClick={e => e.preventDefault()} className="hover:text-white hover:underline">
                  {lang === 'hi' ? 'हाइपरलिंक नीति' : 'Hyperlinking Policy'}
                </a>
              </li>
              <li>
                <a href="#rti" onClick={e => e.preventDefault()} className="hover:text-white hover:underline">
                  {lang === 'hi' ? 'सूचना का अधिकार (RTI)' : 'Right to Information (RTI)'}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: National Portals & Quick Tools */}
          <div className="space-y-2">
            <div className="text-white font-bold text-xs uppercase tracking-wider border-b border-slate-700 pb-1.5 text-amber-300">
              {lang === 'hi' ? 'सरकारी पोर्टल' : 'Official Portals'}
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              <li>
                <a
                  href="https://igotkarmayogi.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white hover:underline flex items-center gap-1"
                >
                  <span>iGOT Karmayogi Portal</span>
                  <ExternalLink className="w-2.5 h-2.5 text-amber-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://mospi.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white hover:underline flex items-center gap-1"
                >
                  <span>MoSPI Official Portal</span>
                  <ExternalLink className="w-2.5 h-2.5 text-amber-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.india.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white hover:underline flex items-center gap-1"
                >
                  <span>National Portal of India</span>
                  <ExternalLink className="w-2.5 h-2.5 text-amber-400" />
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenFormula}
                  className="text-amber-300 hover:text-white hover:underline cursor-pointer text-left"
                >
                  {lang === 'hi' ? 'स्कोरिंग सूत्र (PRD §6.1)' : 'Scoring Formula (§6.1)'}
                </button>
              </li>
              <li>
                <button
                  onClick={onResetData}
                  className="text-slate-400 hover:text-white hover:underline cursor-pointer text-left"
                >
                  {lang === 'hi' ? 'डेमो डेटा रीसेट करें' : 'Reset Demo Seed Data'}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Middle Attribution Strip: National Informatics Centre (NIC) & Digital India */}
      <div className="bg-[#071b33] py-6 px-4 sm:px-8 border-b border-slate-700/60">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          {/* NIC Official Footer Block with Authentic NIC Link */}
          <div className="flex items-center gap-4">
            {/* NIC Emblem Insignia */}
            <a
              href="https://www.nic.in"
              target="_blank"
              rel="noreferrer"
              className="w-13 h-13 rounded-lg bg-gradient-to-br from-[#0B2545] to-[#13315C] border-2 border-blue-400/50 p-1 flex flex-col items-center justify-center shrink-0 shadow-md hover:border-amber-400 transition-colors group cursor-pointer"
              title="National Informatics Centre, Government of India (External website that opens in a new window)"
            >
              <span className="font-extrabold text-[15px] tracking-tight text-white leading-none group-hover:text-amber-300">
                NIC
              </span>
              <span className="text-[7.5px] text-amber-300 font-bold uppercase tracking-widest mt-0.5">
                एनआईसी
              </span>
            </a>

            <div>
              <div className="text-[11px] text-slate-400">
                {lang === 'hi' ? 'परिकल्पना, निर्माण एवं होस्टिंग:' : 'Designed, Developed and Hosted by'}
              </div>
              <a
                href="https://www.nic.in"
                target="_blank"
                rel="noreferrer"
                className="text-white hover:text-amber-300 font-bold text-sm sm:text-base tracking-wide flex items-center gap-1.5 transition-colors group inline-flex"
                title="National Informatics Centre, Ministry of Electronics & Information Technology, Government of India (External link)"
              >
                <span>राष्ट्रीय सूचना-विज्ञान केंद्र / National Informatics Centre (NIC)</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <div className="text-[11px] text-slate-300 font-medium">
                Ministry of Electronics & Information Technology, Government of India
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                <span>Cloud Infrastructure: National Data Centre (MeghRaj)</span>
                <span>·</span>
                <a
                  href="https://www.nic.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-300/80 hover:text-amber-300 underline"
                >
                  nic.in
                </a>
              </div>
            </div>
          </div>

          {/* Compliance & National Digital Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Digital India Link Badge */}
            <a
              href="https://www.digitalindia.gov.in"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-slate-600 hover:border-slate-400 hover:bg-white/10 transition-colors text-slate-200"
              title="Digital India - Power to Empower (External site)"
            >
              <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[10px]">
                DI
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-white leading-tight">Digital India</div>
                <div className="text-[8px] text-slate-400 leading-none">Power to Empower</div>
              </div>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400 ml-1" />
            </a>

            {/* GIGW 3.0 Compliance Badge */}
            <a
              href="https://guidelines.india.gov.in"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-slate-600 hover:border-slate-400 hover:bg-white/10 transition-colors text-slate-200"
              title="Guidelines for Indian Government Websites (GIGW 3.0) STQC Certified"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] font-bold text-white leading-tight">GIGW 3.0 Compliant</div>
                <div className="text-[8px] text-slate-400 leading-none">STQC Certified Standards</div>
              </div>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400 ml-1" />
            </a>

            {/* National Portal of India Badge */}
            <a
              href="https://www.india.gov.in"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-slate-600 hover:border-slate-400 hover:bg-white/10 transition-colors text-slate-200"
              title="National Portal of India (External site)"
            >
              <Globe className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] font-bold text-white leading-tight">india.gov.in</div>
                <div className="text-[8px] text-slate-400 leading-none">National Portal of India</div>
              </div>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400 ml-1" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Attribution Bar */}
      <div className="bg-[#051324] py-4 px-4 sm:px-8 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            <div>
              Website Content Managed by <strong>Ministry of Statistics and Programme Implementation</strong>, Government of India.
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              SIH Problem Statement SIH26101 · Kaushal Karmayogi Intelligence Layer for iGOT Karmayogi.
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="font-semibold text-slate-300">
              अंतिम नवीनीकरण / Last Updated: <span className="text-amber-400">28 September 2026</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Hosted in National Data Centre (NDC), New Delhi
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
