import React, { useState } from 'react';
import {
  CompetencyCode,
  DepartmentType,
  RoleType,
} from '../types/index.ts';
import { SEED_COMPETENCIES, SEED_ROLE_TARGETS } from '../server/seed.ts';
import { X, ArrowRight, ArrowLeft, Check, Sparkles, User, Briefcase, Award } from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/i18n.ts';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (payload: {
    name: string;
    email: string;
    department: DepartmentType;
    designation: RoleType;
    years_experience: number;
    self_ratings: Record<CompetencyCode, number>;
  }) => void;
  lang: Language;
}

const RATING_DESCRIPTIONS: Record<number, { title: string; desc: string }> = {
  1: { title: '1 - Novice', desc: 'Little to no exposure; requires direct guidance.' },
  2: { title: '2 - Basic', desc: 'Understands basic terms; assists with supervision.' },
  3: { title: '3 - Competent', desc: 'Applies standard MoSPI rules independently.' },
  4: { title: '4 - Proficient', desc: 'Solves non-standard exceptions; mentors juniors.' },
  5: { title: '5 - Expert', desc: 'Authoritative specialist; drafts official methodologies.' },
};

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  lang,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<DepartmentType>('NSO');
  const [designation, setDesignation] = useState<RoleType>('Data Analyst');
  const [yearsExperience, setYearsExperience] = useState(3);

  const [ratings, setRatings] = useState<Record<CompetencyCode, number>>({
    DC: 3,
    SD: 3,
    DP: 3,
    SA: 3,
    DV: 3,
    SO: 3,
    LE: 3,
  });

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRatingChange = (code: CompetencyCode, val: number) => {
    setRatings(prev => ({ ...prev, [code]: val }));
  };

  const handleFinish = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onComplete({
        name: name.trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@mospi.gov.in`,
        department,
        designation,
        years_experience: yearsExperience,
        self_ratings: ratings,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const currentRoleTargets = SEED_ROLE_TARGETS[designation] || SEED_ROLE_TARGETS['Data Analyst'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col">
        {/* Wizard Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-[#0b2545] text-white rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                MoSPI Capacity Building
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-slate-300">Step {step} of 3</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white">Official Cadre Onboarding & Skill Audit</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 1: Official Profile & Deployment</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your assigned administrative division and official role to calibrate your target benchmarks.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Government Email ID (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh.chandra@mospi.gov.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department / Directorate <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={department}
                      onChange={e => setDepartment(e.target.value as DepartmentType)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="NSO">National Statistical Office (NSO)</option>
                      <option value="NSS">NSS (Field Operations Division)</option>
                      <option value="DES">State Directorate of Economics & Statistics</option>
                      <option value="DPD">Data Processing Division (DPD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Cadre Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={designation}
                      onChange={e => setDesignation(e.target.value as RoleType)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Data Analyst">Data Analyst</option>
                      <option value="Field Investigator">Field Investigator</option>
                      <option value="Survey Supervisor">Survey Supervisor</option>
                      <option value="Statistical Officer">Statistical Officer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Years of Statistical Experience: <strong>{yearsExperience} years</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={yearsExperience}
                    onChange={e => setYearsExperience(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Entry (0-1 yr)</span>
                    <span>Mid-career (5-10 yrs)</span>
                    <span>Senior (15+ yrs)</span>
                  </div>
                </div>

                {/* Role target preview snippet */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                  <div className="font-semibold text-slate-800 mb-1">
                    Cadre Target Benchmarks for {designation}:
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {Object.entries(currentRoleTargets).map(([code, target]) => (
                      <span key={code} className="text-slate-600">
                        {code}: <strong>{target}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Step 2: Self-Rating Across 7 Statistics Competencies
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rate your current proficiency from 1 to 5. This establishes your initial baseline prior before quiz calibration.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                {SEED_COMPETENCIES.map(comp => {
                  const currentVal = ratings[comp.code] || 3;
                  const roleTarget = currentRoleTargets[comp.code];

                  return (
                    <div
                      key={comp.code}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/40"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{comp.name}</span>
                          <span className="text-[11px] text-slate-400 font-semibold">({comp.code})</span>
                          <span className="text-[10px] text-slate-500">· {comp.frac_type}</span>
                        </div>
                        <span className="text-xs text-slate-500">
                          Role Target: <strong className="text-amber-700">{roleTarget}</strong>
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                        {comp.description}
                      </p>

                      {/* 1 to 5 Rating selector */}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(comp.code, star)}
                            className={`flex-1 py-1.5 px-1 rounded-md text-xs font-semibold text-center transition-all cursor-pointer ${
                              currentVal === star
                                ? 'bg-[#0b2545] text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>{star}</span>
                          </button>
                        ))}
                      </div>

                      <div className="text-[11px] text-slate-500 italic mt-1.5">
                        Selected: <strong>{RATING_DESCRIPTIONS[currentVal].title}</strong> —{' '}
                        {RATING_DESCRIPTIONS[currentVal].desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 3: Review & Generate Intelligence Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm your cadre details. Once saved, your personalised radar chart and recommended iGOT courses will immediately populate.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Official Name:</span>
                  <span className="font-bold text-slate-900">{name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Cadre Role & Dept:</span>
                  <span className="font-bold text-slate-900">
                    {designation} · {department}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Experience:</span>
                  <span className="font-bold text-slate-900">{yearsExperience} years</span>
                </div>

                <div className="pt-2">
                  <div className="font-semibold text-slate-700 mb-2">Initial Gaps Summary:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SEED_COMPETENCIES.map(c => {
                      const self = ratings[c.code];
                      const target = currentRoleTargets[c.code];
                      const gap = Math.max(0, target - self);

                      return (
                        <div key={c.code} className="p-2 bg-white rounded border border-slate-200 text-center">
                          <div className="text-[11px] font-bold text-slate-800">{c.code}</div>
                          <div className="text-[10px] text-slate-500">
                            {self} / {target}
                          </div>
                          <div
                            className={`text-xs font-bold mt-0.5 ${
                              gap > 0 ? 'text-amber-700' : 'text-emerald-700'
                            }`}
                          >
                            {gap > 0 ? `Gap: -${gap}` : 'Met'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && !name.trim()) {
                  alert('Please enter official full name to proceed.');
                  return;
                }
                setStep((step + 1) as any);
              }}
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-[#0b2545] hover:bg-[#13315c] text-white rounded-lg transition-colors cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={submitting}
              className="inline-flex items-center gap-1 px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{submitting ? 'Generating Profile...' : 'Complete Onboarding'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
