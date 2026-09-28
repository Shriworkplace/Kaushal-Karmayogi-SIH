export type CompetencyCode = 'DC' | 'SD' | 'DP' | 'SA' | 'DV' | 'SO' | 'LE';

export type Fractype = 'Domain' | 'Functional' | 'Behavioural';

export type RoleType =
  | 'Data Analyst'
  | 'Field Investigator'
  | 'Survey Supervisor'
  | 'Statistical Officer';

export type DepartmentType =
  | 'NSO'
  | 'NSS'
  | 'DES'
  | 'DPD';

export type UserRole = 'learner' | 'admin';

export interface Competency {
  code: CompetencyCode;
  name: string;
  frac_type: Fractype;
  description: string;
}

export interface User {
  id: string;
  clerk_id: string;
  name: string;
  email: string;
  role: UserRole;
  department: DepartmentType;
  designation: RoleType | 'Training Director' | 'Joint Director (Training)';
  years_experience: number;
  avatar?: string;
  created_at: string;
}

export interface SelfRating {
  id: string;
  user_id: string;
  competency_code: CompetencyCode;
  rating: number; // 1-5
  created_at: string;
}

export interface CompetencyScore {
  id: string;
  user_id: string;
  competency_code: CompetencyCode;
  current: number; // 1-5
  source: 'self' | 'quiz';
  created_at: string;
}

export interface CourseCompetencyWeight {
  code: CompetencyCode;
  weight: 1 | 2 | 3; // 1: light, 2: secondary, 3: primary
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Course {
  id: string;
  title: string;
  description: string;
  duration_mins: number;
  language: 'English' | 'Hindi';
  difficulty: DifficultyLevel;
  mock_url: string;
  competencies: CourseCompetencyWeight[];
}

export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string];
  correct_index: number;
  explanation: string;
  competency: CompetencyCode;
  difficulty: DifficultyLevel;
}

export interface Quiz {
  id: string;
  material_id?: string;
  title: string;
  competency_code: CompetencyCode;
  difficulty: DifficultyLevel;
  status: 'draft' | 'published';
  created_by: string;
  created_at: string;
  questions: Question[];
}

export interface AttemptAnswer {
  question_id: string;
  selected_index: number;
  is_correct: boolean;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  quiz_title: string;
  competency_code: CompetencyCode;
  score: number;
  total: number;
  taken_at: string;
  answers: AttemptAnswer[];
  delta_applied?: {
    code: CompetencyCode;
    before: number;
    after: number;
  };
}

export interface Material {
  id: string;
  title: string;
  filename: string;
  extracted_text: string;
  competency_code?: CompetencyCode;
  created_by: string;
  created_at: string;
  char_count: number;
}

export interface CompetencyGapItem {
  code: CompetencyCode;
  name: string;
  frac_type: Fractype;
  current: number;
  target: number;
  gap: number;
  self: number;
  n_questions: number;
  n_correct: number;
}

export interface CourseRecommendation {
  course: Course;
  score: number;
  reason: string;
  covered_gaps: {
    code: CompetencyCode;
    name: string;
    gap: number;
    weight: number;
  }[];
}

export interface DashboardResponse {
  user: User;
  competencies: CompetencyGapItem[];
  top_weak_areas: CompetencyGapItem[];
  recommended_courses: CourseRecommendation[];
  recent_attempts: QuizAttempt[];
  completed_course_ids: string[];
  last_delta?: {
    code: CompetencyCode;
    name: string;
    before: number;
    after: number;
    change: number;
  };
}
