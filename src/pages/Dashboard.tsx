import { useAuth } from "../auth/AuthProvider";
import { ButtonLink } from "../components/ui/Button";
import { ErrorState, Spinner } from "../components/ui/State";
import { supabase } from "../lib/supabase";
import { unwrap, useAsync } from "../lib/useAsync";

interface Progress { total_lessons: number; completed_lessons: number; percent: number; avg_quiz_percent: number | null }

export default function Dashboard() {
  const { profile } = useAuth();

  const { data, loading, error, reload } = useAsync(async () => {
    const course = unwrap(await supabase.from("courses").select("id").eq("slug", "frontend-edu").maybeSingle()) as { id: string } | null;
    if (!course) return null;
    const rows = unwrap(await supabase.rpc("my_course_progress", { p_course_id: course.id })) as Progress[];
    return rows[0] ?? null;
  }, []);

  if (loading) return <div className="container-page"><Spinner /></div>;
  if (error) return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;

  const percent = Number(data?.percent ?? 0);

  return (
    <div className="container-page max-w-4xl space-y-6 py-12">
      <h1 className="text-3xl font-bold">Salom, {profile?.full_name || "o‘quvchi"}!</h1>
      <section className="card space-y-4" aria-label="Umumiy o‘zlashtirish">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Umumiy o‘zlashtirish</h2>
          <span className="font-mono text-sm">{percent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-navy-700" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${percent}%` }} />
        </div>
        <dl className="grid gap-3 sm:grid-cols-3">
          <div><dt className="text-sm text-slate-500">Yakunlangan mavzular</dt><dd className="text-xl font-bold">{data?.completed_lessons ?? 0} / {data?.total_lessons ?? 0}</dd></div>
          <div><dt className="text-sm text-slate-500">O‘rtacha test natijasi</dt><dd className="text-xl font-bold">{data?.avg_quiz_percent != null ? `${data.avg_quiz_percent}%` : "—"}</dd></div>
          <div><dt className="text-sm text-slate-500">Rol</dt><dd className="text-xl font-bold capitalize">{profile?.role ?? "—"}</dd></div>
        </dl>
      </section>
      <div className="flex flex-wrap gap-3">
        <ButtonLink to="/oquv-dasturi">O‘qishni davom ettirish</ButtonLink>
        <ButtonLink to="/yakuniy-test" variant="secondary">Yakuniy test</ButtonLink>
        <ButtonLink to="/sertifikatlar" variant="ghost">Sertifikatlarim</ButtonLink>
      </div>
    </div>
  );
}
