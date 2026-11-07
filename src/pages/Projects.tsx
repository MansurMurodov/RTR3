import { ErrorState, Spinner } from "../components/ui/State";
import { supabase } from "../lib/supabase";
import { unwrap, useAsync } from "../lib/useAsync";
import { difficultyLabel, type ProjectItem } from "../lib/types";

const Block = ({ title, items }: { title: string; items: string[] }) =>
  items.length === 0 ? null : (
    <div><h4 className="text-sm font-semibold">{title}</h4><ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">{items.map((x) => <li key={x}>{x}</li>)}</ul></div>
  );

export default function Projects() {
  const { data, loading, error, reload } = useAsync(async () =>
    unwrap(await supabase.from("projects").select("id,position,title,goal,requirements,steps,technologies,criteria,brief,difficulty").order("position")) as ProjectItem[], []);

  if (loading) return <div className="container-page"><Spinner /></div>;
  if (error) return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;

  return (
    <div className="container-page space-y-6 py-12">
      <header>
        <h1 className="text-3xl font-bold">Yakuniy loyihalar</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Mustaqil bajarish uchun {data?.length} ta loyiha namunasi. O‘zingizga mosini tanlang.</p>
      </header>
      <ul className="grid gap-4 lg:grid-cols-2">
        {data?.map((p) => (
          <li key={p.id}>
            <details className="card group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <span>
                  <span className="block font-semibold">{p.position}. {p.title}</span>
                  <span className="text-sm text-slate-500">{p.goal}</span>
                </span>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-primary-light">{difficultyLabel[p.difficulty]}</span>
              </summary>
              <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-navy-700">
                {p.brief && <p className="text-sm"><b>Namuna va topshiriq:</b> {p.brief}</p>}
                <Block title="Talablar" items={p.requirements} />
                <Block title="Ish bosqichlari" items={p.steps} />
                <div className="flex flex-wrap gap-1.5">
                  {p.technologies.map((t) => <span key={t} className="rounded-lg bg-slate-200 px-2 py-0.5 font-mono text-xs dark:bg-navy-700">{t}</span>)}
                </div>
                {p.criteria && <p className="text-sm text-secondary dark:text-secondary-light"><b>Baholash mezonlari:</b> {p.criteria}</p>}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
