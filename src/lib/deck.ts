import { supabase } from "./supabase";
import { unwrap } from "./useAsync";
import type { Lesson, PracticalTask, TheoryBlock } from "./types";

export type Slide =
  | { kind: "title"; title: string; subtitle: string; note: string }
  | { kind: "bullets"; title: string; bullets: string[] }
  | { kind: "code"; title: string; code: string; note?: string }
  | { kind: "end"; title: string; bullets: string[] };

export interface DeckData {
  lesson: Lesson & { modules: { title: string } | null };
  theory: TheoryBlock[];
  tasks: PracticalTask[];
  author: string;
  hasQuiz: boolean;
}

export async function loadDeckData(id: string): Promise<DeckData | null> {
  const lesson = unwrap(await supabase.from("lessons")
    .select("id,number,title,hours,objective,tasks,outcomes,requirements,difficulty,modules(title)")
    .eq("id", id).maybeSingle()) as unknown as DeckData["lesson"] | null;
  if (!lesson) return null;
  const [theory, tasks, quizzes, course] = await Promise.all([
    supabase.from("lesson_theory").select("id,position,title,kind,content_md,code_examples").eq("lesson_id", id).order("position"),
    supabase.from("practical_tasks").select("id,position,title,goal,steps_md,starter_code,solution_code,code_explanation,expected_result,independent_task").eq("lesson_id", id).order("position"),
    supabase.from("quizzes").select("id").eq("lesson_id", id).eq("is_final", false),
    supabase.from("courses").select("author_name").eq("slug", "frontend-edu").maybeSingle(),
  ]);
  return {
    lesson,
    theory: unwrap(theory) as TheoryBlock[],
    tasks: unwrap(tasks) as PracticalTask[],
    hasQuiz: !quizzes.error && (quizzes.data?.length ?? 0) > 0,
    author: (course.data as { author_name: string | null } | null)?.author_name || "Mansur Murodov",
  };
}

const MAX_BULLET = 200;

function shorten(text: string): string {
  if (text.length <= MAX_BULLET) return text;
  const cut = text.slice(0, MAX_BULLET);
  const space = cut.lastIndexOf(" ");
  return cut.slice(0, space > 80 ? space : MAX_BULLET) + "…";
}

export function bulletsFrom(md: string): string[] {
  const out: string[] = [];
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("•")) { out.push(shorten(line.replace(/^•\s*/, ""))); continue; }
    const numbered = line.match(/^\d+\.\s+(.*)/);
    if (numbered) { out.push(shorten(numbered[1])); continue; }
    for (const part of line.replace(/([.!?])\s+/g, "$1\u0001").split("\u0001")) {
      if (part.trim()) out.push(shorten(part.trim()));
    }
  }
  return out;
}

function chunk(items: string[], maxItems = 6, maxChars = 560): string[][] {
  const groups: string[][] = [];
  let cur: string[] = [];
  let chars = 0;
  for (const it of items) {
    if (cur.length > 0 && (cur.length >= maxItems || chars + it.length > maxChars)) { groups.push(cur); cur = []; chars = 0; }
    cur.push(it);
    chars += it.length;
  }
  if (cur.length) groups.push(cur);
  return groups;
}

function addBullets(slides: Slide[], title: string, items: string[]) {
  chunk(items).forEach((g, i) => slides.push({ kind: "bullets", title: i === 0 ? title : `${title} (davomi)`, bullets: g }));
}

export function buildSlides(d: DeckData): Slide[] {
  const { lesson } = d;
  const slides: Slide[] = [{
    kind: "title",
    title: `${lesson.number}-mavzu. ${lesson.title}`,
    subtitle: `${lesson.modules?.title ?? ""} · ${lesson.hours} soat`,
    note: `Muallif: ${d.author}`,
  }];

  const aim = [lesson.objective, ...lesson.tasks].filter((x): x is string => Boolean(x));
  if (aim.length) addBullets(slides, "Dars maqsadi va vazifalari", aim.map(shorten));
  const results = [...lesson.outcomes, ...lesson.requirements.map((r) => `Kerak: ${r}`)];
  if (results.length) addBullets(slides, "Kutiladigan natijalar", results.map(shorten));

  for (const b of d.theory) {
    addBullets(slides, b.title, bulletsFrom(b.content_md));
    for (const c of b.code_examples) {
      slides.push({ kind: "code", title: c.title || "Kod namunasi", code: c.code, note: c.explanation ? shorten(c.explanation) : undefined });
    }
  }

  const task = d.tasks[0];
  if (task) {
    const steps = (task.steps_md ?? "").split("\n").map((s) => s.trim().replace(/^\d+\.\s*/, "")).filter(Boolean);
    const items = [task.goal ? `Maqsad: ${task.goal}` : "", ...steps.map(shorten), task.expected_result ? `Natija: ${task.expected_result}` : ""].filter(Boolean);
    addBullets(slides, `Amaliy ish: ${task.title}`, items.map(shorten));
  }

  const review: string[] = [];
  if (task?.independent_task) review.push(`Mustaqil topshiriq: ${task.independent_task}`);
  if (d.hasQuiz) review.push("Mavzu testi: 5 savol, o‘tish chegarasi 55%");
  review.push("Muammo bo‘lsa, nazariya va amaliyot bo‘limlariga qayting");
  addBullets(slides, "Mustahkamlash", review.map(shorten));

  const summary = d.theory.map((b) => b.title);
  slides.push({ kind: "end", title: "Xulosa", bullets: summary.length ? summary : [lesson.title] });
  return slides;
}
