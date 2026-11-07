import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EmptyState, ErrorState, Spinner } from "../components/ui/State";
import { supabase } from "../lib/supabase";
import { unwrap, useAsync } from "../lib/useAsync";
import type { GlossaryTerm } from "../lib/types";

export default function Glossary() {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string | null>(null);

  const { data, loading, error, reload } = useAsync(async () => {
    const res = await supabase.from("glossary").select("id,term,term_en,definition,category,first_letter").order("term");
    return unwrap(res) as GlossaryTerm[];
  }, []);

  const letters = useMemo(() => [...new Set((data ?? []).map((t) => t.first_letter))].sort(), [data]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter(
      (t) =>
        (!letter || t.first_letter === letter) &&
        (!q || t.term.toLowerCase().includes(q) || (t.term_en ?? "").toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)),
    );
  }, [data, query, letter]);

  if (loading) return <div className="container-page"><Spinner /></div>;
  if (error) return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;

  return (
    <div className="container-page space-y-6 py-12">
      <h1 className="text-3xl font-bold">Glossariy</h1>
      {data?.length === 0 ? (
        <EmptyState title="Atamalar hali qo‘shilmagan" hint="Atamalar administrator tomonidan kiritiladi." />
      ) : (
        <>
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Atama qidirish…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Atama qidirish" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setLetter(null)} className={`rounded-lg px-2.5 py-1 text-sm ${letter === null ? "bg-primary text-white" : "bg-slate-200 dark:bg-navy-700"}`}>Hammasi</button>
            {letters.map((l) => (
              <button key={l} onClick={() => setLetter(l)} className={`rounded-lg px-2.5 py-1 text-sm ${letter === l ? "bg-primary text-white" : "bg-slate-200 dark:bg-navy-700"}`}>{l}</button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="Hech narsa topilmadi" />
          ) : (
            <dl className="grid gap-3 md:grid-cols-2">
              {filtered.map((t) => (
                <div key={t.id} className="card">
                  <dt className="font-semibold">{t.term}{t.term_en && <span className="ml-2 font-mono text-xs text-slate-500">{t.term_en}</span>}</dt>
                  <dd className="mt-1 text-sm">{t.definition}</dd>
                </div>
              ))}
            </dl>
          )}
        </>
      )}
    </div>
  );
}
