import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Download, Maximize2, Printer } from "lucide-react";
import SlideView from "../components/SlideView";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState, Spinner } from "../components/ui/State";
import { buildSlides, loadDeckData } from "../lib/deck";
import { downloadPptx } from "../lib/pptx";
import { useAsync } from "../lib/useAsync";

export default function Deck() {
  const { id = "" } = useParams();
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const stage = useRef<HTMLDivElement>(null);

  const { data, loading, error, reload } = useAsync(async () => {
    const d = await loadDeckData(id);
    return d ? { d, slides: buildSlides(d) } : null;
  }, [id]);

  const total = data?.slides.length ?? 0;
  const go = useCallback((step: number) => setIndex((cur) => Math.min(Math.max(cur + step, 0), Math.max(total - 1, 0))), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") go(1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (loading) return <div className="container-page"><Spinner /></div>;
  if (error) return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;
  if (!data) return <div className="container-page py-12"><EmptyState title="Mavzu topilmadi" /></div>;

  const { d, slides } = data;
  const exportPptx = async () => {
    setBusy(true); setMsg(null);
    try { await downloadPptx(slides, `frontend-edu-mavzu-${d.lesson.number}.pptx`); }
    catch (e) { setMsg(e instanceof Error ? e.message : "PPTX yaratib bo‘lmadi"); }
    setBusy(false);
  };

  return (
    <div className="container-page max-w-5xl space-y-4 py-8 print:max-w-none print:p-0">
      <div className="space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link to={`/mavzu/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary"><ChevronLeft className="h-4 w-4" /> {d.lesson.number}-mavzu</Link>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => void stage.current?.requestFullscreen?.()}><Maximize2 className="h-4 w-4" /> To‘liq ekran</Button>
            <Button variant="ghost" onClick={() => window.print()}><Printer className="h-4 w-4" /> PDF</Button>
            <Button onClick={exportPptx} disabled={busy}><Download className="h-4 w-4" /> {busy ? "Tayyorlanmoqda…" : "PPTX yuklab olish"}</Button>
          </div>
        </div>
        {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}

        <div ref={stage} className="flex flex-col justify-center bg-slate-50 data-[fs]:bg-black dark:bg-navy-900">
          <SlideView slide={slides[index]} index={index} total={total} />
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => go(-1)} disabled={index === 0}><ChevronLeft className="h-4 w-4" /> Oldingi</Button>
          <span className="font-mono text-sm">{index + 1} / {total}</span>
          <Button variant="ghost" onClick={() => go(1)} disabled={index >= total - 1}>Keyingi <ChevronRight className="h-4 w-4" /></Button>
        </div>
        <p className="text-xs text-slate-500">Klaviaturadagi ← va → tugmalari bilan slaydlarni almashtiring. PDF: chop etish oynasida "PDF sifatida saqlash" ni tanlang (landshaft).</p>
      </div>

      <div className="hidden print:block">
        {slides.map((s, i) => (
          <div key={i} className="break-after-page"><SlideView slide={s} index={i} total={total} /></div>
        ))}
      </div>
    </div>
  );
}
