import { ErrorState, Spinner } from "../components/ui/State";
import { supabase } from "../lib/supabase";
import { unwrap, useAsync } from "../lib/useAsync";
import type { Course } from "../lib/types";

export default function About() {
  const { data, loading, error, reload } = useAsync(async () => {
    const res = await supabase.from("courses").select("id,slug,title,description,goal,total_hours,author_name").eq("slug", "frontend-edu").maybeSingle();
    return unwrap(res) as Course | null;
  }, []);

  if (loading) return <div className="container-page"><Spinner /></div>;
  if (error) return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;

  return (
    <div className="container-page max-w-3xl space-y-6 py-12">
      <h1 className="text-3xl font-bold">Kurs haqida</h1>
      <div className="card space-y-4">
        <h2 className="text-xl font-semibold">{data?.title}</h2>
        <p>{data?.description}</p>
        <div>
          <h3 className="font-semibold">Fanning maqsadi</h3>
          <p className="mt-1 text-slate-600 dark:text-slate-300">{data?.goal}</p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div><dt className="text-sm text-slate-500">Umumiy hajm</dt><dd className="font-semibold">{data?.total_hours} soat</dd></div>
          <div><dt className="text-sm text-slate-500">Muallif</dt><dd className="font-semibold">{data?.author_name}</dd></div>
        </dl>
      </div>
    </div>
  );
}
