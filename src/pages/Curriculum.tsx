import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ErrorState, Spinner } from "../components/ui/State";
import { supabase } from "../lib/supabase";
import { unwrap, useAsync } from "../lib/useAsync";
import { difficultyLabel, type ModuleWithLessons } from "../lib/types";

export default function Curriculum() {
  const { data, loading, error, reload } = useAsync(async () => {
    const res = await supabase
      .from("modules")
      .select("id,position,title,hours,lessons(id,number,title,hours,difficulty)")
      .order("position");
    const rows = unwrap(res) as ModuleWithLessons[];
    return rows.map((m) => ({ ...m, lessons: [...m.lessons].sort((a, b) => a.number - b.number) }));
  }, []);

  if (loading) return <div className="container-page"><Spinner /></div>;
  if (error) return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;

  return (
    <div className="container-page space-y-8 py-12">
      <header>
        <h1 className="text-3xl font-bold">O‘quv dasturi</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">70 soat · {data?.reduce((n, m) => n + m.lessons.length, 0)} ta mavzu</p>
      </header>
      {data?.map((m) => (
        <section key={m.id} className="space-y-3">
          <h2 className="flex items-baseline justify-between gap-3 text-lg font-semibold">
            <span>{m.title}</span>
            <span className="shrink-0 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary dark:text-secondary-light">{m.hours} soat</span>
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {m.lessons.map((l) => (
              <li key={l.id}>
                <Link to={`/mavzu/${l.id}`} className="card group flex items-center gap-4 transition hover:-translate-y-0.5 hover:border-primary">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary dark:text-primary-light">{l.number}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{l.title}</span>
                    <span className="text-xs text-slate-500">{l.hours} soat · {difficultyLabel[l.difficulty]}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
