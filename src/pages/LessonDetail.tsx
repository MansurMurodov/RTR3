import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, CheckCircle2, ChevronLeft, ClipboardCheck, Code2, Download, Info, Presentation } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import PracticePanel from "../components/PracticePanel";
import QuizRunner from "../components/QuizRunner";
import { Button, ButtonLink } from "../components/ui/Button";
import { EmptyState, ErrorState, Spinner } from "../components/ui/State";
import { supabase } from "../lib/supabase";
import { unwrap, useAsync } from "../lib/useAsync";
import { difficultyLabel, type Lesson, type PracticalTask, type QuizMeta, type TheoryBlock } from "../lib/types";

interface LessonFull extends Lesson { modules: { title: string } | null }
type TabId = "about" | "theory" | "practice" | "slides" | "quiz";
interface PresFile { id: string; title: string; file_type: string; storage_path: string }

const List = ({ title, items }: { title: string; items: string[] }) =>
  items.length === 0 ? null : (
    <div><h3 className="font-semibold">{title}</h3><ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">{items.map((x) => <li key={x}>{x}</li>)}</ul></div>
  );

export default function LessonDetail() {
  const { id = "" } = useParams();
  const { session } = useAuth();
  const [tab, setTab] = useState<TabId>("theory");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload } = useAsync(async () => {
    const lesson = unwrap(await supabase.from("lessons")
      .select("id,number,title,hours,objective,tasks,outcomes,requirements,difficulty,modules(title)")
      .eq("id", id).maybeSingle()) as unknown as LessonFull | null;
    const [theory, tasks, assignments, quizzes, pres] = await Promise.all([
      supabase.from("lesson_theory").select("id,position,title,kind,content_md,code_examples").eq("lesson_id", id).order("position"),
      supabase.from("practical_tasks").select("id,position,title,goal,steps_md,starter_code,solution_code,code_explanation,expected_result,independent_task").eq("lesson_id", id).order("position"),
      supabase.from("assignments").select("id,practical_task_id").eq("lesson_id", id),
      supabase.from("quizzes").select("id,title,description,time_limit_minutes,pass_percent").eq("lesson_id", id).eq("is_final", false).order("created_at"),
      supabase.from("presentations").select("id,title,file_type,storage_path").eq("lesson_id", id).order("created_at"),
    ]);
    return {
      lesson,
      theory: unwrap(theory) as TheoryBlock[],
      tasks: unwrap(tasks) as PracticalTask[],
      assignments: (assignments.error ? [] : assignments.data) as { id: string; practical_task_id: string | null }[],
      quiz: ((quizzes.error ? [] : quizzes.data) as QuizMeta[])[0] ?? null,
      files: (pres.error ? [] : pres.data) as PresFile[],
    };
  }, [id, session?.user.id]);

  const rpc = async (fn: "mark_lesson_complete" | "set_lesson_step", args: Record<string, unknown>, okText: string) => {
    setBusy(true); setMessage(null);
    const { error: err } = await supabase.rpc(fn, args);
    setMessage(err ? { ok: false, text: err.message } : { ok: true, text: okText });
    setBusy(false);
  };

  if (loading) return <div className="container-page"><Spinner /></div>;
  if (error) return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;
  if (!data?.lesson) {
    return (
      <div className="container-page py-12">
        <EmptyState title="Mavzu topilmadi" hint="Mavzu o‘chirilgan yoki hali nashr etilmagan bo‘lishi mumkin.">
          <ButtonLink to="/oquv-dasturi" variant="ghost">O‘quv dasturiga qaytish</ButtonLink>
        </EmptyState>
      </div>
    );
  }
  const { lesson, theory, tasks, assignments, quiz, files } = data;

  const tabs: { id: TabId; label: string; icon: typeof Info }[] = [
    { id: "about", label: "Mavzu haqida", icon: Info },
    { id: "theory", label: "Nazariya", icon: BookOpen },
    { id: "practice", label: "Amaliyot", icon: Code2 },
    { id: "slides", label: "Taqdimot", icon: Presentation },
    { id: "quiz", label: "Test", icon: ClipboardCheck },
  ];

  return (
    <div className="container-page max-w-4xl space-y-6 py-10">
      <Link to="/oquv-dasturi" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> O‘quv dasturi
      </Link>
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary dark:text-primary-light">{lesson.modules?.title}</p>
        <h1 className="text-3xl font-bold">{lesson.number}-mavzu. {lesson.title}</h1>
        <p className="text-sm text-slate-500">{lesson.hours} soat · {difficultyLabel[lesson.difficulty]}</p>
      </header>

      <div role="tablist" aria-label="Mavzu bo‘limlari" className="flex flex-wrap gap-1 rounded-xl bg-slate-200 p-1 dark:bg-navy-700">
        {tabs.map(({ id: tid, label, icon: Icon }) => (
          <button key={tid} role="tab" aria-selected={tab === tid} onClick={() => setTab(tid)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${tab === tid ? "bg-white shadow dark:bg-navy-900" : ""}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "about" && (
        <section className="card space-y-4">
          {lesson.objective && <div><h3 className="font-semibold">Dars maqsadi</h3><p className="mt-1 text-sm">{lesson.objective}</p></div>}
          <List title="Dars vazifalari" items={lesson.tasks} />
          <List title="Kutiladigan natijalar" items={lesson.outcomes} />
          <List title="Kerakli dasturlar va jihozlar" items={lesson.requirements} />
          {!lesson.objective && lesson.tasks.length === 0 && <p className="text-sm text-slate-500">Bu mavzu uchun ma’lumot hali kiritilmagan.</p>}
        </section>
      )}

      {tab === "theory" && (
        <section className="space-y-4">
          {theory.length === 0 ? (
            <EmptyState title="Nazariy matn hali joylanmagan" hint="Mazmun tez orada qo‘shiladi." />
          ) : (
            <>
              {theory.map((b) => (
                <article key={b.id} className="card space-y-3">
                  <h3 className="text-lg font-semibold">{b.title}</h3>
                  <p className="whitespace-pre-wrap leading-relaxed">{b.content_md}</p>
                  {b.code_examples.map((c, i) => (
                    <figure key={i} className="space-y-1">
                      {c.title && <figcaption className="text-sm font-medium">{c.title}</figcaption>}
                      <pre className="overflow-x-auto rounded-xl bg-navy-900 p-4 font-mono text-xs text-slate-100">{c.code}</pre>
                      {c.explanation && <p className="text-sm text-slate-500">{c.explanation}</p>}
                    </figure>
                  ))}
                </article>
              ))}
              {session && (
                <Button variant="ghost" disabled={busy} onClick={() => rpc("set_lesson_step", { p_lesson_id: id, p_step: "theory" }, "Nazariya o‘qilgan deb belgilandi")}>
                  Nazariyani o‘qib chiqdim
                </Button>
              )}
            </>
          )}
        </section>
      )}

      {tab === "practice" && (tasks.length === 0
        ? <EmptyState title="Amaliy mashg‘ulot hali qo‘shilmagan" hint="Mazmun tez orada qo‘shiladi." />
        : <PracticePanel lessonId={id} tasks={tasks} assignments={assignments} />)}

      {tab === "slides" && (
        <section className="space-y-4">
          <div className="card space-y-3">
            <h3 className="text-lg font-semibold">Mavzu taqdimoti</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Slaydlar shu mavzuning maqsadi, nazariyasi, kod namunalari va amaliy ishidan yig‘ilgan. Brauzerda ko‘rishingiz, PPTX yuklab olishingiz yoki PDF sifatida saqlashingiz mumkin.</p>
            <ButtonLink to={`/taqdimot/${id}`}><Presentation className="h-4 w-4" /> Slaydlarni ochish</ButtonLink>
          </div>
          {files.length > 0 && (
            <div className="card space-y-2">
              <h3 className="font-semibold">Yuklangan taqdimot fayllari</h3>
              <ul className="space-y-2 text-sm">
                {files.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-3">
                    <span>{f.title} <span className="font-mono text-xs uppercase text-slate-500">{f.file_type}</span></span>
                    <a className="inline-flex items-center gap-1 text-primary underline" href={supabase.storage.from("presentations").getPublicUrl(f.storage_path).data.publicUrl} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /> Yuklab olish</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {tab === "quiz" && (quiz
        ? <QuizRunner quiz={quiz} />
        : <EmptyState title="Bu mavzu uchun test hali yaratilmagan" />)}

      <div className="space-y-2 border-t border-slate-200 pt-6 dark:border-navy-700">
        {session ? (
          <Button onClick={() => rpc("mark_lesson_complete", { p_lesson_id: id }, "Mavzu yakunlandi!")} disabled={busy}>
            <CheckCircle2 className="h-4 w-4" /> Mavzuni yakunlash
          </Button>
        ) : (
          <p className="text-sm text-slate-500">Progressni saqlash uchun <Link to="/kirish" className="text-primary underline">tizimga kiring</Link>.</p>
        )}
        {message && <p role="status" className={`text-sm ${message.ok ? "text-secondary" : "text-red-600"}`}>{message.text}</p>}
      </div>
    </div>
  );
}
