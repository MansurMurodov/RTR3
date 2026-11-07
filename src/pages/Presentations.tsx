import { useState } from "react";
import { Link } from "react-router-dom";
import { Archive, Download, Presentation } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ErrorState, Spinner } from "../components/ui/State";
import { buildSlides, loadDeckData } from "../lib/deck";
import { downloadPptx, pptxBlob } from "../lib/pptx";
import { supabase } from "../lib/supabase";
import { unwrap, useAsync } from "../lib/useAsync";
import type { ModuleWithLessons } from "../lib/types";

const fileName = (n: number) => `frontend-edu-mavzu-${String(n).padStart(2, "0")}.pptx`;

export default function Presentations() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [zipProgress, setZipProgress] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const { data, loading, error, reload } = useAsync(async () => {
    const res = await supabase.from("modules").select("id,position,title,hours,lessons(id,number,title,hours,difficulty)").order("position");
    return (unwrap(res) as ModuleWithLessons[]).map((m) => ({ ...m, lessons: [...m.lessons].sort((a, b) => a.number - b.number) }));
  }, []);

  const one = async (id: string, number: number) => {
    setBusyId(id); setMsg(null);
    try {
      const d = await loadDeckData(id);
      if (!d) throw new Error("Mavzu topilmadi");
      await downloadPptx(buildSlides(d), fileName(number));
    } catch (e) { setMsg(e instanceof Error ? e.message : "PPTX yaratib bo‘lmadi"); }
    setBusyId(null);
  };

  const all = async () => {
    if (!data) return;
    setMsg(null);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const lessons = data.flatMap((m) => m.lessons);
      for (let i = 0; i < lessons.length; i++) {
        setZipProgress(`${i + 1} / ${lessons.length} tayyorlanmoqda…`);
        const d = await loadDeckData(lessons[i].id);
        if (!d) continue;
        zip.file(fileName(lessons[i].number), await pptxBlob(buildSlides(d), `Mavzu ${lessons[i].number}`));
      }
      setZipProgress("ZIP yig‘ilmoqda…");
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "frontend-edu-taqdimotlar.zip"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { setMsg(e instanceof Error ? e.message : "ZIP yaratib bo‘lmadi"); }
    setZipProgress(null);
  };

  if (loading) return <div className="container-page"><Spinner /></div>;
  if (error) return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;

  return (
    <div className="container-page space-y-8 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Taqdimotlar</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Har bir mavzu uchun taqdimot: brauzerda ko‘rish yoki PPTX yuklab olish.</p>
        </div>
        <Button onClick={all} disabled={zipProgress !== null}><Archive className="h-4 w-4" /> {zipProgress ?? "Hammasini ZIP qilib yuklab olish"}</Button>
      </header>
      {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
      {data?.map((m) => (
        <section key={m.id} className="space-y-3">
          <h2 className="text-lg font-semibold">{m.title}</h2>
          <ul className="space-y-2">
            {m.lessons.map((l) => (
              <li key={l.id} className="card flex flex-wrap items-center gap-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary dark:text-primary-light">{l.number}</span>
                <span className="min-w-0 flex-1 text-sm font-medium">{l.title}</span>
                <Link to={`/taqdimot/${l.id}`} className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-navy-700 dark:hover:bg-navy-700"><Presentation className="h-4 w-4" /> Ko‘rish</Link>
                <Button variant="ghost" onClick={() => one(l.id, l.number)} disabled={busyId === l.id}><Download className="h-4 w-4" /> {busyId === l.id ? "…" : "PPTX"}</Button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
