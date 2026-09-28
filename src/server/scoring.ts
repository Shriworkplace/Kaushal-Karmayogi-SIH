import {
  CompetencyCode,
  Course,
  CourseRecommendation,
  DifficultyLevel,
} from '../types/index.ts';

export const COMPETENCY_ORDER: CompetencyCode[] = [
  'DC',
  'SD',
  'DP',
  'SA',
  'DV',
  'SO',
  'LE',
];

export const COMPETENCY_NAMES: Record<CompetencyCode, string> = {
  DC: 'Data Collection',
  SD: 'Sampling Design',
  DP: 'Data Processing',
  SA: 'Statistical Analysis',
  DV: 'Data Visualization',
  SO: 'Survey Operations',
  LE: 'Legal & Ethical',
};

/**
 * 6.1 Current competency score:
 * self = latest self-rating (1–5)
 * n = number of quiz questions the learner has answered in that competency
 * q = fraction correct across those questions (0–1), converted to scale: q5 = 1 + 4 × q
 * Weight of evidence: w = min(0.7, 0.05 × n)
 * current = (1 − w) × self + w × q5, rounded to 1 decimal
 */
export function computeCurrentScore(
  selfRating: number,
  nQuestionsAnswered: number,
  nCorrectQuestions: number
): number {
  if (nQuestionsAnswered <= 0) {
    return Number(selfRating.toFixed(1));
  }

  const q = nCorrectQuestions / nQuestionsAnswered;
  const q5 = 1 + 4 * q;
  const w = Math.min(0.7, 0.05 * nQuestionsAnswered);
  const current = (1 - w) * selfRating + w * q5;

  return Number(current.toFixed(1));
}

/**
 * 6.2 Gap calculation:
 * gap = max(0, target − current) per competency
 */
export function computeGap(target: number, current: number): number {
  return Math.max(0, Number((target - current).toFixed(1)));
}

/**
 * Difficulty fit:
 * level = beginner if current < 2.5, intermediate if 2.5–3.5, advanced if > 3.5
 * fit = 1.0 (match), 0.6 (one level off), 0.3 (two levels off)
 */
export function getDifficultyFit(
  currentScore: number,
  courseDifficulty: DifficultyLevel
): number {
  let learnerLevel = 1; // beginner
  if (currentScore > 3.5) {
    learnerLevel = 3; // advanced
  } else if (currentScore >= 2.5) {
    learnerLevel = 2; // intermediate
  }

  const courseLevelMap: Record<DifficultyLevel, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
  };

  const courseLevel = courseLevelMap[courseDifficulty] || 1;
  const distance = Math.abs(courseLevel - learnerLevel);

  if (distance === 0) return 1.0;
  if (distance === 1) return 0.6;
  return 0.3;
}

export interface CompetencyStatus {
  code: CompetencyCode;
  name: string;
  current: number;
  target: number;
  gap: number;
}

/**
 * 6.3 Course recommendation ranking & reason template:
 * score(course) = Σ over competencies i covered: gap_i × weight_i × fit
 * Return the top 3–5 courses with score > 0.
 */
export function rankRecommendedCourses(
  competencyMap: Record<CompetencyCode, CompetencyStatus>,
  allCourses: Course[],
  completedCourseIds: string[]
): CourseRecommendation[] {
  const recommendations: CourseRecommendation[] = [];

  for (const course of allCourses) {
    if (completedCourseIds.includes(course.id)) {
      continue;
    }

    let courseScore = 0;
    const coveredGaps: {
      code: CompetencyCode;
      name: string;
      gap: number;
      weight: number;
    }[] = [];

    // Primary competency for the reason string
    let maxGappedComp: CompetencyStatus | null = null;
    let maxCompGap = -1;

    for (const compWeight of course.competencies) {
      const compStatus = competencyMap[compWeight.code];
      if (!compStatus) continue;

      const fit = getDifficultyFit(compStatus.current, course.difficulty);
      const contribution = compStatus.gap * compWeight.weight * fit;
      courseScore += contribution;

      if (compStatus.gap > 0) {
        coveredGaps.push({
          code: compWeight.code,
          name: compStatus.name,
          gap: compStatus.gap,
          weight: compWeight.weight,
        });

        if (compStatus.gap > maxCompGap) {
          maxCompGap = compStatus.gap;
          maxGappedComp = compStatus;
        }
      }
    }

    if (courseScore > 0 && maxGappedComp) {
      // Reason string template per PRD §6.3:
      // "Recommended because your **{competency}** score is **{current}** vs your role target of **{target}** (gap **{gap}**), and this **{difficulty}** course covers {competency} directly."
      // If a course covers 2+ gapped competencies, list up to two in the reason.
      let reason: string;
      if (coveredGaps.length >= 2) {
        const otherComp = coveredGaps.find(c => c.code !== maxGappedComp!.code);
        reason = `Recommended because your **${maxGappedComp.name}** score is **${maxGappedComp.current}** vs your role target of **${maxGappedComp.target}** (gap **${maxGappedComp.gap}**), and this **${course.difficulty}** course covers ${maxGappedComp.name} and ${otherComp?.name || 'related competencies'}.`;
      } else {
        reason = `Recommended because your **${maxGappedComp.name}** score is **${maxGappedComp.current}** vs your role target of **${maxGappedComp.target}** (gap **${maxGappedComp.gap}**), and this **${course.difficulty}** course covers ${maxGappedComp.name} directly.`;
      }

      recommendations.push({
        course,
        score: Number(courseScore.toFixed(2)),
        reason,
        covered_gaps: coveredGaps,
      });
    }
  }

  // Sort by score descending
  recommendations.sort((a, b) => b.score - a.score);

  // Return top 3-5 courses
  return recommendations.slice(0, 5);
}
