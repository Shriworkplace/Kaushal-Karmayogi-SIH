import React, { useState, useEffect } from 'react';
import {
  Course,
  DashboardResponse,
  Material,
  Quiz,
  QuizAttempt,
  User,
} from './types/index.ts';
import { Header } from './components/Header.tsx';
import { GovBreadcrumb } from './components/GovBreadcrumb.tsx';
import { CadreBanner } from './components/CadreBanner.tsx';
import { GovFooter } from './components/GovFooter.tsx';
import { RadarChart } from './components/RadarChart.tsx';
import { TopWeakAreas } from './components/TopWeakAreas.tsx';
import { RecommendedCourses } from './components/RecommendedCourses.tsx';
import { CourseCatalog } from './components/CourseCatalog.tsx';
import { QuizPlayer } from './components/QuizPlayer.tsx';
import { QuizzesList } from './components/QuizzesList.tsx';
import { AiQuizGenerator } from './components/AiQuizGenerator.tsx';
import { AdminHeatmap } from './components/AdminHeatmap.tsx';
import { FormulaModal } from './components/FormulaModal.tsx';
import { OnboardingWizard } from './components/OnboardingWizard.tsx';
import { IgotModal } from './components/IgotModal.tsx';
import { ChatAdvisor } from './components/ChatAdvisor.tsx';
import { Language, TRANSLATIONS } from './utils/i18n.ts';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  FileQuestion,
  RefreshCw,
  Clock,
  CheckCircle,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [selectedIgotCourse, setSelectedIgotCourse] = useState<Course | null>(null);

  // Modals
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Admin Analytics state
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [courseEffectiveness, setCourseEffectiveness] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>(null);

  // Language & Accessibility state
  const [lang, setLang] = useState<Language>('en');
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(0);
  const [contrastMode, setContrastMode] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [deltaBannerDismissed, setDeltaBannerDismissed] = useState(false);

  const t = TRANSLATIONS[lang];

  // Font size multiplier
  const fontSizeClass =
    fontSizeLevel === 1 ? 'text-[108%]' : fontSizeLevel === -1 ? 'text-[92%]' : '';

  const handleFontSizeChange = (delta: number) => {
    if (delta === 0) setFontSizeLevel(0);
    else setFontSizeLevel(prev => Math.min(1, Math.max(-1, prev + delta)));
  };

  // Load initial applet data
  const loadAppData = async () => {
    try {
      setLoading(true);
      // Fetch user & all demo users
      const [meRes, usersRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/auth/users'),
      ]);
      const meData = await meRes.json();
      const usersData = await usersRes.json();

      setCurrentUser(meData.user);
      setAllUsers(usersData.users || []);

      // If admin, default tab to analytics, otherwise dashboard
      if (meData.user?.role === 'admin') {
        setActiveTab('analytics');
      } else {
        setActiveTab('dashboard');
      }

      await refreshRoleData(meData.user);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshRoleData = async (user?: User | null) => {
    const active = user || currentUser;
    if (!active) return;

    // Load courses and quizzes
    const [coursesRes, quizzesRes] = await Promise.all([
      fetch('/api/courses'),
      fetch('/api/quizzes'),
    ]);
    const coursesData = await coursesRes.json();
    const quizzesData = await quizzesRes.json();

    setCourses(coursesData.courses || []);
    setQuizzes(quizzesData.quizzes || []);

    if (active.role === 'learner') {
      const dashRes = await fetch('/api/me/dashboard');
      const dashData = await dashRes.json();
      setDashboard(dashData);
    } else {
      // Admin analytics
      const [heatRes, effRes, suggRes, statsRes, matsRes] = await Promise.all([
        fetch('/api/admin/analytics/heatmap'),
        fetch('/api/admin/analytics/courses'),
        fetch('/api/admin/analytics/suggestions'),
        fetch('/api/admin/summary'),
        fetch('/api/admin/materials'),
      ]);
      setHeatmapData(await heatRes.json());
      const effData = await effRes.json();
      setCourseEffectiveness(effData.courses || []);
      const suggData = await suggRes.json();
      setSuggestions(suggData.suggestions || []);
      setSummaryStats(await statsRes.json());
      const matsData = await matsRes.json();
      setMaterials(matsData.materials || []);
    }
  };

  useEffect(() => {
    loadAppData();
  }, []);

  // SSO Switch User handler
  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setCurrentUser(data.user);
      setActiveQuiz(null);
      setDeltaBannerDismissed(false);

      if (data.user.role === 'admin') {
        setActiveTab('analytics');
      } else {
        setActiveTab('dashboard');
      }

      await refreshRoleData(data.user);
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  // Complete Onboarding
  const handleCompleteOnboarding = async (payload: any) => {
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setCurrentUser(data.user);
    setDashboard(data.dashboard);
    setActiveTab('dashboard');
    setActiveQuiz(null);

    // Refresh users list
    const usersRes = await fetch('/api/auth/users');
    const usersData = await usersRes.json();
    setAllUsers(usersData.users || []);
  };

  // Course completion toggle
  const handleToggleComplete = async (courseId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/complete`, { method: 'POST' });
      const data = await res.json();
      if (data.dashboard) {
        setDashboard(data.dashboard);
      }
      if (currentUser?.role === 'admin') {
        await refreshRoleData(currentUser);
      }
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  // Quiz submission
  const handleSubmitQuizAttempt = async (answers: any[]) => {
    if (!activeQuiz) throw new Error('No active quiz');

    const res = await fetch(`/api/quizzes/${activeQuiz.id}/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    const data = await res.json();

    if (data.dashboard) {
      setDashboard(data.dashboard);
    }
    setDeltaBannerDismissed(false);
    return data;
  };

  // Admin Quiz Generation
  const handleGenerateQuiz = async (payload: any) => {
    const res = await fetch('/api/admin/quizzes/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Quiz generation failed');
    }
    const data = await res.json();

    // Refresh quizzes
    const qRes = await fetch('/api/quizzes');
    const qData = await qRes.json();
    setQuizzes(qData.quizzes || []);

    return data;
  };

  const handleUpdateQuiz = async (quizId: string, updates: any) => {
    const res = await fetch(`/api/admin/quizzes/${quizId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    return data.quiz;
  };

  const handlePublishQuiz = async (quizId: string) => {
    const res = await fetch(`/api/admin/quizzes/${quizId}/publish`, {
      method: 'POST',
    });
    const data = await res.json();

    // Refresh quizzes
    const qRes = await fetch('/api/quizzes');
    const qData = await qRes.json();
    setQuizzes(qData.quizzes || []);

    return data.quiz;
  };

  const handleUploadMaterial = async (payload: any) => {
    const res = await fetch('/api/admin/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMaterials(prev => [data.material, ...prev]);
    return data.material;
  };

  const handleResetData = async () => {
    if (!confirm('Reset all demo data back to pristine MoSPI seed state? This restores the initial 12 learners, published quizzes, and ratings.')) {
      return;
    }
    try {
      await fetch('/api/admin/reset', { method: 'POST' });
      await loadAppData();
      alert('Demo data successfully reset!');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-700">Loading MoSPI Kaushal Karmayogi Intelligence...</p>
        </div>
      </div>
    );
  }

  const isLearner = currentUser?.role === 'learner';
  const completedIds = dashboard?.completed_course_ids || [];

  return (
    <div
      className={`min-h-screen flex flex-col transition-all ${fontSizeClass} ${
        contrastMode ? 'bg-[#000000] text-[#FFFFFF]' : 'bg-[#F4F6F9] text-slate-800'
      }`}
    >
      {/* Top Header with Parichay SSO Switcher & Government Emblem */}
      <Header
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        onOpenOnboarding={() => setOnboardingOpen(true)}
        onOpenFormulaModal={() => setFormulaModalOpen(true)}
        onResetData={handleResetData}
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab);
          setActiveQuiz(null);
        }}
        lang={lang}
        onToggleLang={() => setLang(l => (l === 'en' ? 'hi' : 'en'))}
        fontSizeLevel={fontSizeLevel}
        onChangeFontSize={handleFontSizeChange}
        contrastMode={contrastMode}
        onToggleContrast={() => setContrastMode(c => !c)}
      />

      {/* Official Government Breadcrumb Navigation */}
      <GovBreadcrumb
        activeTab={activeTab}
        lang={lang}
        onNavigateHome={() => {
          setActiveQuiz(null);
          setActiveTab(isLearner ? 'dashboard' : 'analytics');
        }}
      />

      {/* Main App Body */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 focus:outline-none">
        {/* Learner Views */}
        {isLearner && (
          <>
            {/* Active Quiz Player Overlay/View */}
            {activeQuiz ? (
              <QuizPlayer
                quiz={activeQuiz}
                onClose={() => setActiveQuiz(null)}
                onSubmitAttempt={handleSubmitQuizAttempt}
                onReturnToDashboard={() => {
                  setActiveQuiz(null);
                  setActiveTab('dashboard');
                }}
              />
            ) : (
              <>
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && dashboard && (
                  <div className="space-y-6">
                    {/* Official Cadre Identity Banner */}
                    {currentUser && <CadreBanner user={currentUser} lang={lang} />}
                    {/* Before → After Delta Update Banner (PRD §4.5 F-44) */}
                    {dashboard.last_delta && !deltaBannerDismissed && (
                      <div className="bg-white rounded-lg border border-slate-300 border-l-4 border-l-emerald-600 p-4.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                            <Sparkles className="w-5 h-5 text-emerald-700" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {t.deltaAlertTitle}
                              </span>
                              <span className="text-slate-400 text-xs">·</span>
                              <span className="text-[11px] font-mono text-slate-500">Live Recalibration Event</span>
                            </div>
                            <div className="text-sm font-semibold text-slate-900 mt-0.5">
                              {dashboard.last_delta.name} score updated from{' '}
                              <span className="font-bold text-slate-600">{dashboard.last_delta.before}</span> →{' '}
                              <span className="font-extrabold text-emerald-700">{dashboard.last_delta.after}</span>{' '}
                              <span className="text-xs font-bold text-emerald-700">({dashboard.last_delta.change >= 0 ? `+${dashboard.last_delta.change}` : dashboard.last_delta.change} pts)</span>.
                              Radar chart and iGOT recommendations have recalibrated in real time.
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setDeltaBannerDismissed(true)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold rounded-md transition-colors cursor-pointer shrink-0"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}

                    {/* Top Row: Radar Chart + Top Weak Areas */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div className="lg:col-span-7">
                        <RadarChart
                          items={dashboard.competencies}
                          lang={lang}
                          onSelectCompetency={code => {
                            setActiveTab('quizzes');
                          }}
                        />
                      </div>

                      <div className="lg:col-span-5">
                        <TopWeakAreas
                          weakAreas={dashboard.top_weak_areas}
                          lang={lang}
                          onTakeQuiz={code => {
                            const matching = quizzes.find(q => q.competency_code === code && q.status === 'published');
                            if (matching) {
                              setActiveQuiz(matching);
                            } else {
                              setActiveTab('quizzes');
                            }
                          }}
                          onBrowseCourses={code => {
                            setActiveTab('catalog');
                          }}
                        />
                      </div>
                    </div>

                    {/* Middle Section: Recommended Courses */}
                    <RecommendedCourses
                      recommendations={dashboard.recommended_courses}
                      completedCourseIds={completedIds}
                      onToggleComplete={handleToggleComplete}
                      onOpenIgotModal={course => setSelectedIgotCourse(course)}
                      lang={lang}
                    />

                    {/* Recent Attempts (PRD §4.2 F-13) */}
                    {dashboard.recent_attempts && dashboard.recent_attempts.length > 0 && (
                      <div className="bg-white rounded-lg border border-slate-300 p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-600" />
                            <span>{t.recentAttempts}</span>
                          </h3>
                          <span className="text-xs text-slate-500 font-mono">Official Evaluation Log</span>
                        </div>

                        <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
                          <table className="w-full text-xs text-left min-w-[520px]">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                                <th className="py-2 px-3">Assessment Title</th>
                                <th className="py-2 px-2">Competency</th>
                                <th className="py-2 px-2 text-center">Score</th>
                                <th className="py-2 px-2 text-center">Accuracy</th>
                                <th className="py-2 px-3 text-right">Date Taken</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {dashboard.recent_attempts.map(att => (
                                <tr key={att.id} className="hover:bg-slate-50">
                                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                                    {att.quiz_title}
                                  </td>
                                  <td className="py-2.5 px-2 text-slate-600">
                                    {att.competency_code}
                                  </td>
                                  <td className="py-2.5 px-2 text-center font-bold text-blue-700">
                                    {att.score} / {att.total}
                                  </td>
                                  <td className="py-2.5 px-2 text-center font-semibold text-slate-700">
                                    {Math.round((att.score / att.total) * 100)}%
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-slate-500">
                                    {new Date(att.taken_at).toLocaleDateString([], {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quizzes Tab */}
                {activeTab === 'quizzes' && (
                  <QuizzesList
                    quizzes={quizzes}
                    onSelectQuiz={q => setActiveQuiz(q)}
                    lang={lang}
                    userAttempts={dashboard?.recent_attempts}
                  />
                )}

                {/* Course Catalog Tab */}
                {activeTab === 'catalog' && (
                  <CourseCatalog
                    courses={courses}
                    completedCourseIds={completedIds}
                    onToggleComplete={handleToggleComplete}
                    onOpenIgotModal={course => setSelectedIgotCourse(course)}
                    lang={lang}
                  />
                )}

                {/* AI Advisor Tab */}
                {activeTab === 'advisor' && <ChatAdvisor />}
              </>
            )}
          </>
        )}

        {/* Admin Views */}
        {!isLearner && (
          <>
            {activeTab === 'analytics' && heatmapData && (
              <AdminHeatmap
                heatmapData={heatmapData}
                courseEffectiveness={courseEffectiveness}
                suggestions={suggestions}
                summaryStats={summaryStats}
                onTriggerQuizGenForComp={code => {
                  setActiveTab('generator');
                }}
              />
            )}

            {activeTab === 'generator' && (
              <AiQuizGenerator
                materials={materials}
                onUploadMaterial={handleUploadMaterial}
                onGenerateQuiz={handleGenerateQuiz}
                onUpdateQuiz={handleUpdateQuiz}
                onPublishQuiz={handlePublishQuiz}
                onQuizPublishedRedirect={() => {
                  setActiveTab('quizzes');
                }}
              />
            )}

            {activeTab === 'quizzes' && (
              <QuizzesList
                quizzes={quizzes}
                onSelectQuiz={q => setActiveQuiz(q)}
                lang={lang}
              />
            )}

            {activeTab === 'catalog' && (
              <CourseCatalog
                courses={courses}
                completedCourseIds={completedIds}
                onToggleComplete={handleToggleComplete}
                onOpenIgotModal={course => setSelectedIgotCourse(course)}
                lang={lang}
              />
            )}
          </>
        )}
      </main>

      {/* Official Government Footer */}
      <GovFooter
        lang={lang}
        onOpenFormula={() => setFormulaModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Modals */}
      <FormulaModal
        isOpen={formulaModalOpen}
        onClose={() => setFormulaModalOpen(false)}
      />

      <OnboardingWizard
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={handleCompleteOnboarding}
        lang={lang}
      />

      <IgotModal
        course={selectedIgotCourse}
        onClose={() => setSelectedIgotCourse(null)}
        isCompleted={
          selectedIgotCourse ? completedIds.includes(selectedIgotCourse.id) : false
        }
        onToggleComplete={handleToggleComplete}
      />
    </div>
  );
}
