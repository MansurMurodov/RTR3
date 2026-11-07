import { Link } from "react-router-dom";
import QuizRunner from "../components/QuizRunner";
import { ButtonLink } from "../components/ui/Button";
import { EmptyState, ErrorState, Spinner } from "../components/ui/State";
import { supabase } from "../lib/supabase";
import { unwrap, useAsync } from "../lib/useAsync";
import type { QuizMeta } from "../lib/types";

interface Progress { total_lessons: number; completed_lessons: number; percent: number }

export default function FinalTest() {
  const { data, loading, error, reload } = useAsync(async () => {
    const quiz = unwrap(await supabase.from("quizzes").select("id,title,description,time_limit_minutes,pass_percent")
      .eq("is_final", true).eq("is_published", true).limit(1).maybeSingle()) as QuizMeta | null;
    const course = unwrap(await supabase.from("courses").select("id").eq("slug", "frontend-edu").maybeSingle()) as { id: string } | null;
    let progress: Progress | null = null;
    if (course) {
      const rows = unwrap(await supabase.rpc("my_course_progress", { p_course_id: course.id })) as Progress[];
      progress = rows[0] ?? null;
    }
    return { quiz, progress };
  }, []);

  if (loading) return <div className="container-page"><Spinner /></div>;
  if (error) return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;
  if (!data?.quiz) return <div className="container-page py-12"><EmptyState title="Yakuniy test hali yaratilmagan" /></div>;

  const p = data.progress;
  return (
    <div className="container-page max-w-3xl space-y-6 py-12">
      <h1 className="text-3xl font-bold">Yakuniy test</h1>
      {p && (
        <div className="card text-sm">
          Yakunlangan mavzular: <b>{p.completed_lessons} / {p.total_lessons}</b>. Sertifikat olish uchun barcha mavzularni yakunlab, shu testdan o‘tish kerak.
        </div>
      )}
      <QuizRunner quiz={data.quiz} />
      <ButtonLink to="/sertifikatlar" variant="ghost">Sertifikatlarim</ButtonLink>
      <p className="text-sm text-slate-500">Mavzular ro‘yxati: <Link to="/oquv-dasturi" className="text-primary underline">O‘quv dasturi</Link></p>
    </div>
  );
}
