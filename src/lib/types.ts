export type AppRole = "super_admin" | "admin" | "teacher" | "student";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  is_blocked: boolean;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  goal: string | null;
  total_hours: number;
  author_name: string | null;
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  hours: number;
  objective: string | null;
  tasks: string[];
  outcomes: string[];
  requirements: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface ModuleWithLessons {
  id: string;
  position: number;
  title: string;
  hours: number;
  lessons: Pick<Lesson, "id" | "number" | "title" | "hours" | "difficulty">[];
}

export interface TheoryBlock {
  id: string;
  position: number;
  title: string;
  kind: string;
  content_md: string;
  code_examples: { title?: string; language?: string; code: string; explanation?: string }[];
}

export interface LearningMethod {
  id: string;
  position: number;
  name: string;
  definition: string | null;
  procedure: string | null;
  suitable_topics: string | null;
  expected_result: string | null;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  term_en: string | null;
  definition: string;
  category: string | null;
  first_letter: string;
}

export const difficultyLabel: Record<Lesson["difficulty"], string> = {
  beginner: "Boshlang‘ich",
  intermediate: "O‘rta",
  advanced: "Yuqori",
};

export interface CodeBundle { html: string; css: string; js: string }

export interface PracticalTask {
  id: string;
  position: number;
  title: string;
  goal: string | null;
  steps_md: string | null;
  starter_code: CodeBundle;
  solution_code: CodeBundle;
  code_explanation: string | null;
  expected_result: string | null;
  independent_task: string | null;
}

export interface QuizMeta { id: string; title: string; description: string | null; time_limit_minutes: number | null; pass_percent: number }

export const gradeLabel: Record<number, string> = { 5: "5 – A‘lo", 4: "4 – Yaxshi", 3: "3 – Qoniqarli", 2: "2 – Qoniqarsiz" };

export interface ProjectItem {
  id: string;
  position: number;
  title: string;
  goal: string | null;
  requirements: string[];
  steps: string[];
  technologies: string[];
  criteria: string | null;
  brief: string | null;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface CertificateInfo {
  certificate_no: string;
  full_name: string | null;
  course_title: string;
  total_hours: number;
  author_name: string | null;
  issued_at: string;
}

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};
