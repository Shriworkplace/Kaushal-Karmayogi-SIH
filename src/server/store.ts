import fs from 'fs';
import path from 'path';
import {
  AttemptAnswer,
  Competency,
  CompetencyCode,
  CompetencyGapItem,
  Course,
  DashboardResponse,
  Material,
  Question,
  Quiz,
  QuizAttempt,
  RoleType,
  SelfRating,
  User,
} from '../types/index.ts';
import {
  computeCurrentScore,
  computeGap,
  rankRecommendedCourses,
  COMPETENCY_NAMES,
  COMPETENCY_ORDER,
} from './scoring.ts';
import {
  SEED_ATTEMPTS,
  SEED_COMPETENCIES,
  SEED_COMPLETIONS,
  SEED_COURSES,
  SEED_MATERIALS,
  SEED_QUIZZES,
  SEED_ROLE_TARGETS,
  SEED_SELF_RATINGS,
  SEED_USERS,
} from './seed.ts';

interface AppStoreData {
  currentUserId: string;
  users: User[];
  competencies: Competency[];
  courses: Course[];
  materials: Material[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  selfRatings: Record<string, Record<CompetencyCode, number>>;
  selfRatingHistory: SelfRating[];
  courseCompletions: Record<string, string[]>;
  lastDeltas: Record<string, { code: CompetencyCode; name: string; before: number; after: number; change: number }>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

class Store {
  private data: AppStoreData;

  constructor() {
    this.data = this.loadInitial();
  }

  private loadInitial(): AppStoreData {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.courses && parsed.quizzes) {
          return parsed;
        }
      }
    } catch {
      // Fallback to fresh seed
    }

    return this.createFreshSeed();
  }

  private createFreshSeed(): AppStoreData {
    const history: SelfRating[] = [];
    const now = new Date().toISOString();

    for (const [userId, ratings] of Object.entries(SEED_SELF_RATINGS)) {
      for (const [code, rating] of Object.entries(ratings)) {
        history.push({
          id: `sr-${userId}-${code}-${Date.now()}`,
          user_id: userId,
          competency_code: code as CompetencyCode,
          rating,
          created_at: now,
        });
      }
    }

    return {
      currentUserId: 'user-01', // Priya Sharma default
      users: [...SEED_USERS],
      competencies: [...SEED_COMPETENCIES],
      courses: [...SEED_COURSES],
      materials: [...SEED_MATERIALS],
      quizzes: [...SEED_QUIZZES],
      attempts: [...SEED_ATTEMPTS],
      selfRatings: JSON.parse(JSON.stringify(SEED_SELF_RATINGS)),
      selfRatingHistory: history,
      courseCompletions: JSON.parse(JSON.stringify(SEED_COMPLETIONS)),
      lastDeltas: {},
    };
  }

  public save(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch {
      // Ignore write errors in read-only environment
    }
  }

  public reset(): void {
    this.data = this.createFreshSeed();
    this.save();
  }

  // --- Auth & Users ---
  public getCurrentUser(): User {
    const user = this.data.users.find(u => u.id === this.data.currentUserId);
    return user || this.data.users[0];
  }

  public setCurrentUser(userId: string): User | null {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      this.data.currentUserId = user.id;
      this.save();
      return user;
    }
    return null;
  }

  public getAllUsers(): User[] {
    return this.data.users;
  }

  public createUser(payload: {
    name: string;
    email: string;
    department: User['department'];
    designation: RoleType;
    years_experience: number;
    self_ratings: Record<CompetencyCode, number>;
  }): User {
    const id = `user-${Date.now().toString(36)}`;
    const newUser: User = {
      id,
      clerk_id: `clerk_${id}`,
      name: payload.name,
      email: payload.email,
      role: 'learner',
      department: payload.department,
      designation: payload.designation,
      years_experience: payload.years_experience,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      created_at: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.data.selfRatings[id] = { ...payload.self_ratings };
    this.data.courseCompletions[id] = [];

    for (const [code, rating] of Object.entries(payload.self_ratings)) {
      this.data.selfRatingHistory.push({
        id: `sr-${id}-${code}-${Date.now()}`,
        user_id: id,
        competency_code: code as CompetencyCode,
        rating,
        created_at: new Date().toISOString(),
      });
    }

    this.data.currentUserId = id;
    this.save();
    return newUser;
  }

  // --- Self Ratings ---
  public updateSelfRatings(userId: string, ratings: Record<CompetencyCode, number>): void {
    if (!this.data.selfRatings[userId]) {
      this.data.selfRatings[userId] = {} as Record<CompetencyCode, number>;
    }

    for (const [code, rating] of Object.entries(ratings)) {
      this.data.selfRatings[userId][code as CompetencyCode] = rating;
      this.data.selfRatingHistory.push({
        id: `sr-${userId}-${code}-${Date.now()}`,
        user_id: userId,
        competency_code: code as CompetencyCode,
        rating,
        created_at: new Date().toISOString(),
      });
    }

    this.save();
  }

  // --- Dashboard Data & Score Computations ---
  public getDashboardData(userId?: string): DashboardResponse {
    const targetUserId = userId || this.data.currentUserId;
    const user = this.data.users.find(u => u.id === targetUserId) || this.data.users[0];

    const role = (user.designation in SEED_ROLE_TARGETS ? user.designation : 'Data Analyst') as RoleType;
    const targets = SEED_ROLE_TARGETS[role];

    const userSelfRatings = this.data.selfRatings[user.id] || {
      DC: 3,
      SD: 3,
      DP: 3,
      SA: 3,
      DV: 3,
      SO: 3,
      LE: 3,
    };

    // Calculate answered quiz questions and correct count per competency
    const compStats: Record<CompetencyCode, { totalQuestions: number; correctQuestions: number }> = {
      DC: { totalQuestions: 0, correctQuestions: 0 },
      SD: { totalQuestions: 0, correctQuestions: 0 },
      DP: { totalQuestions: 0, correctQuestions: 0 },
      SA: { totalQuestions: 0, correctQuestions: 0 },
      DV: { totalQuestions: 0, correctQuestions: 0 },
      SO: { totalQuestions: 0, correctQuestions: 0 },
      LE: { totalQuestions: 0, correctQuestions: 0 },
    };

    const userAttempts = this.data.attempts.filter(a => a.user_id === user.id);
    for (const attempt of userAttempts) {
      if (compStats[attempt.competency_code]) {
        compStats[attempt.competency_code].totalQuestions += attempt.total;
        compStats[attempt.competency_code].correctQuestions += attempt.score;
      }
    }

    const compItems: CompetencyGapItem[] = [];
    const compMapForRec: Record<CompetencyCode, { code: CompetencyCode; name: string; current: number; target: number; gap: number }> = {} as any;

    for (const comp of this.data.competencies) {
      const code = comp.code;
      const self = userSelfRatings[code] ?? 3;
      const stats = compStats[code];
      const target = targets[code] ?? 3;

      const current = computeCurrentScore(self, stats.totalQuestions, stats.correctQuestions);
      const gap = computeGap(target, current);

      const item: CompetencyGapItem = {
        code,
        name: comp.name,
        frac_type: comp.frac_type,
        current,
        target,
        gap,
        self,
        n_questions: stats.totalQuestions,
        n_correct: stats.correctQuestions,
      };

      compItems.push(item);
      compMapForRec[code] = {
        code,
        name: comp.name,
        current,
        target,
        gap,
      };
    }

    // Top 3 weak areas: sorted by gap descending, ties broken by competency order
    const topWeak = [...compItems]
      .filter(item => item.gap > 0)
      .sort((a, b) => {
        if (b.gap !== a.gap) {
          return b.gap - a.gap;
        }
        return COMPETENCY_ORDER.indexOf(a.code) - COMPETENCY_ORDER.indexOf(b.code);
      })
      .slice(0, 3);

    const completed = this.data.courseCompletions[user.id] || [];
    const recommendations = rankRecommendedCourses(compMapForRec, this.data.courses, completed);

    const recentAttempts = [...userAttempts].sort((a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime());

    return {
      user,
      competencies: compItems,
      top_weak_areas: topWeak,
      recommended_courses: recommendations,
      recent_attempts: recentAttempts,
      completed_course_ids: completed,
      last_delta: this.data.lastDeltas[user.id],
    };
  }

  // --- Courses ---
  public getCourses(filters?: { competency?: string; difficulty?: string; language?: string; search?: string }): Course[] {
    let result = [...this.data.courses];

    if (filters?.competency && filters.competency !== 'all') {
      result = result.filter(c => c.competencies.some(cw => cw.code === filters.competency));
    }
    if (filters?.difficulty && filters.difficulty !== 'all') {
      result = result.filter(c => c.difficulty === filters.difficulty);
    }
    if (filters?.language && filters.language !== 'all') {
      result = result.filter(c => c.language.toLowerCase() === filters.language?.toLowerCase());
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }

    return result;
  }

  public toggleCourseCompletion(userId: string, courseId: string): boolean {
    if (!this.data.courseCompletions[userId]) {
      this.data.courseCompletions[userId] = [];
    }

    const idx = this.data.courseCompletions[userId].indexOf(courseId);
    let completed = false;
    if (idx >= 0) {
      this.data.courseCompletions[userId].splice(idx, 1);
      completed = false;
    } else {
      this.data.courseCompletions[userId].push(courseId);
      completed = true;
    }

    this.save();
    return completed;
  }

  // --- Quizzes ---
  public getQuizzes(forRole: 'learner' | 'admin', competencyFilter?: string): Quiz[] {
    let list = this.data.quizzes;
    if (forRole === 'learner') {
      list = list.filter(q => q.status === 'published');
    }
    if (competencyFilter && competencyFilter !== 'all') {
      list = list.filter(q => q.competency_code === competencyFilter);
    }
    return list;
  }

  public getQuizById(quizId: string, censorAnswers = false): Quiz | null {
    const quiz = this.data.quizzes.find(q => q.id === quizId);
    if (!quiz) return null;

    if (censorAnswers) {
      return {
        ...quiz,
        questions: quiz.questions.map(q => ({
          ...q,
          correct_index: -1,
          explanation: '',
        })),
      };
    }

    return quiz;
  }

  public submitQuizAttempt(
    userId: string,
    quizId: string,
    answers: { question_id: string; selected_index: number }[]
  ): {
    attempt: QuizAttempt;
    dashboard: DashboardResponse;
    delta: { code: CompetencyCode; name: string; before: number; after: number; change: number };
  } {
    const quiz = this.data.quizzes.find(q => q.id === quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Get score before attempt
    const dashBefore = this.getDashboardData(userId);
    const compBefore = dashBefore.competencies.find(c => c.code === quiz.competency_code);
    const beforeScore = compBefore ? compBefore.current : 3.0;

    let score = 0;
    const evaluatedAnswers: AttemptAnswer[] = [];

    for (const ans of answers) {
      const q = quiz.questions.find(item => item.id === ans.question_id);
      if (q) {
        const isCorrect = q.correct_index === ans.selected_index;
        if (isCorrect) score += 1;
        evaluatedAnswers.push({
          question_id: ans.question_id,
          selected_index: ans.selected_index,
          is_correct: isCorrect,
        });
      }
    }

    const attempt: QuizAttempt = {
      id: `att-${Date.now().toString(36)}`,
      user_id: userId,
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      competency_code: quiz.competency_code,
      score,
      total: quiz.questions.length,
      taken_at: new Date().toISOString(),
      answers: evaluatedAnswers,
    };

    this.data.attempts.push(attempt);

    // Compute updated dashboard
    const dashAfter = this.getDashboardData(userId);
    const compAfter = dashAfter.competencies.find(c => c.code === quiz.competency_code);
    const afterScore = compAfter ? compAfter.current : beforeScore;
    const change = Number((afterScore - beforeScore).toFixed(1));

    const delta = {
      code: quiz.competency_code,
      name: COMPETENCY_NAMES[quiz.competency_code] || quiz.competency_code,
      before: beforeScore,
      after: afterScore,
      change,
    };

    attempt.delta_applied = {
      code: quiz.competency_code,
      before: beforeScore,
      after: afterScore,
    };

    this.data.lastDeltas[userId] = delta;
    this.save();

    return {
      attempt,
      dashboard: this.getDashboardData(userId),
      delta,
    };
  }

  // --- Materials ---
  public getMaterials(): Material[] {
    return this.data.materials;
  }

  public createMaterial(payload: {
    title: string;
    filename: string;
    extracted_text: string;
    competency_code?: CompetencyCode;
    created_by: string;
  }): Material {
    const material: Material = {
      id: `mat-${Date.now().toString(36)}`,
      title: payload.title,
      filename: payload.filename,
      extracted_text: payload.extracted_text,
      competency_code: payload.competency_code,
      created_by: payload.created_by,
      created_at: new Date().toISOString(),
      char_count: payload.extracted_text.length,
    };

    this.data.materials.unshift(material);
    this.save();
    return material;
  }

  // --- Quizzes Creation / Management ---
  public createQuiz(quiz: Omit<Quiz, 'id' | 'created_at'>): Quiz {
    const newQuiz: Quiz = {
      ...quiz,
      id: `quiz-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    };
    this.data.quizzes.unshift(newQuiz);
    this.save();
    return newQuiz;
  }

  public updateQuiz(quizId: string, updates: Partial<Quiz>): Quiz {
    const idx = this.data.quizzes.findIndex(q => q.id === quizId);
    if (idx === -1) throw new Error('Quiz not found');

    this.data.quizzes[idx] = {
      ...this.data.quizzes[idx],
      ...updates,
    };
    this.save();
    return this.data.quizzes[idx];
  }

  public publishQuiz(quizId: string): Quiz {
    return this.updateQuiz(quizId, { status: 'published' });
  }

  // --- Analytics ---
  public getHeatmapAnalytics(): {
    departments: {
      code: User['department'];
      name: string;
      learner_count: number;
      gaps: Record<CompetencyCode, number>;
      officials: { id: string; name: string; designation: string; gaps: Record<CompetencyCode, number> }[];
    }[];
    competencies: Competency[];
    overall_averages: Record<CompetencyCode, number>;
  } {
    const deptCodes: User['department'][] = ['NSO', 'NSS', 'DES', 'DPD'];
    const deptNames: Record<User['department'], string> = {
      NSO: 'National Statistical Office (NSO)',
      NSS: 'NSS (Field Operations Division)',
      DES: 'State Directorate of Economics & Statistics',
      DPD: 'Data Processing Division (DPD)',
    };

    const learners = this.data.users.filter(u => u.role === 'learner');

    // Precalculate dashboard items for all learners
    const learnerData = learners.map(u => ({
      user: u,
      dash: this.getDashboardData(u.id),
    }));

    const resultDepts = deptCodes.map(dept => {
      const deptLearners = learnerData.filter(item => item.user.department === dept);
      const gapSums: Record<CompetencyCode, number> = {
        DC: 0,
        SD: 0,
        DP: 0,
        SA: 0,
        DV: 0,
        SO: 0,
        LE: 0,
      };

      const officials = deptLearners.map(item => {
        const officialGaps: Record<CompetencyCode, number> = {} as any;
        for (const c of item.dash.competencies) {
          officialGaps[c.code] = c.gap;
          gapSums[c.code] += c.gap;
        }
        return {
          id: item.user.id,
          name: item.user.name,
          designation: item.user.designation,
          gaps: officialGaps,
        };
      });

      const avgGaps: Record<CompetencyCode, number> = {} as any;
      const count = deptLearners.length || 1;
      for (const code of COMPETENCY_ORDER) {
        avgGaps[code] = Number((gapSums[code] / count).toFixed(2));
      }

      return {
        code: dept,
        name: deptNames[dept] || dept,
        learner_count: deptLearners.length,
        gaps: avgGaps,
        officials,
      };
    });

    const totalLearners = learners.length || 1;
    const overallAverages: Record<CompetencyCode, number> = {} as any;
    for (const code of COMPETENCY_ORDER) {
      const totalGap = learnerData.reduce((acc, curr) => {
        const item = curr.dash.competencies.find(c => c.code === code);
        return acc + (item ? item.gap : 0);
      }, 0);
      overallAverages[code] = Number((totalGap / totalLearners).toFixed(2));
    }

    return {
      departments: resultDepts,
      competencies: this.data.competencies,
      overall_averages: overallAverages,
    };
  }

  public getCourseEffectiveness(): {
    course: Course;
    completions_count: number;
    avg_score_change: number;
    competency_names: string[];
  }[] {
    const results = [];

    for (const course of this.data.courses) {
      // Find learners who completed this course
      let completionCount = 0;
      let totalChange = 0;

      for (const [userId, completedCourseList] of Object.entries(this.data.courseCompletions)) {
        if (completedCourseList.includes(course.id)) {
          completionCount += 1;
          // Calculate average score change on course's competencies
          const userDash = this.getDashboardData(userId);
          let userChange = 0;
          let countedComps = 0;
          for (const cw of course.competencies) {
            const comp = userDash.competencies.find(c => c.code === cw.code);
            if (comp) {
              const diff = comp.current - comp.self;
              userChange += Math.max(0, diff);
              countedComps += 1;
            }
          }
          if (countedComps > 0) {
            totalChange += userChange / countedComps;
          }
        }
      }

      const avgChange = completionCount > 0 ? Number((totalChange / completionCount).toFixed(2)) : 0.0;
      results.push({
        course,
        completions_count: completionCount,
        avg_score_change: avgChange,
        competency_names: course.competencies.map(c => COMPETENCY_NAMES[c.code] || c.code),
      });
    }

    return results.sort((a, b) => b.completions_count - a.completions_count);
  }

  public getSuggestedNewCourses(): {
    competency_code: CompetencyCode;
    competency_name: string;
    avg_gap: number;
    existing_courses_count: number;
    priority: 'High' | 'Medium';
    recommendation: string;
  }[] {
    const heatmap = this.getHeatmapAnalytics();
    const suggestions = [];

    for (const comp of this.data.competencies) {
      const avgGap = heatmap.overall_averages[comp.code] || 0;
      const existing = this.data.courses.filter(c => c.competencies.some(cw => cw.code === comp.code)).length;

      // PRD §4.6 F-52: average gap >= 1.5 or high gap with few courses
      if (avgGap >= 1.0 || existing <= 3) {
        suggestions.push({
          competency_code: comp.code,
          competency_name: comp.name,
          avg_gap: avgGap,
          existing_courses_count: existing,
          priority: (avgGap >= 1.2 ? 'High' : 'Medium') as 'High' | 'Medium',
          recommendation: `High departmental skill gap (${avgGap}) with only ${existing} targeted iGOT courses. Recommend authoring a specialized module on practical field applications.`,
        });
      }
    }

    return suggestions.sort((a, b) => b.avg_gap - a.avg_gap);
  }

  public getSummaryStats() {
    const learners = this.data.users.filter(u => u.role === 'learner');
    const publishedQuizzes = this.data.quizzes.filter(q => q.status === 'published');
    const totalAttempts = this.data.attempts.length;
    const heatmap = this.getHeatmapAnalytics();

    let sumGap = 0;
    for (const val of Object.values(heatmap.overall_averages)) {
      sumGap += val;
    }
    const avgGap = Number((sumGap / COMPETENCY_ORDER.length).toFixed(2));

    return {
      learner_count: learners.length,
      quizzes_published: publishedQuizzes.length,
      quiz_attempts_count: totalAttempts,
      average_competency_gap: avgGap,
      total_courses: this.data.courses.length,
      materials_count: this.data.materials.length,
    };
  }
}

export const store = new Store();
