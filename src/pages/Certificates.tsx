import { useState } from "react";
import { Link } from "react-router-dom";
import { Award } from "lucide-react";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState, Spinner } from "../components/ui/State";
import { supabase } from "../lib/supabase";
import { unwrap, useAsync } from "../lib/useAsync";
import { formatDate } from "../lib/types";

interface Cert { id: string; certificate_no: string; verify_code: string; final_percent: number | null; issued_at: string }

export default function Certificates() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload } = useAsync(async () => {
    const course = unwrap(await supabase.from("courses").select("id").eq("slug", "frontend-edu").maybeSingle()) as { id: string } | null;
    const certs = unwrap(await supabase.from("certificates").select("id,certificate_no,verify_code,final_percent,issued_at").order("issued_at", { ascending: false })) as Cert[];
    return { courseId: course?.id ?? null, certs };
  }, []);

  const issue = async () => {
    if (!data?.courseId) return;
    setBusy(true); setMsg(null);
    const { error: err } = await supabase.rpc("issue_certificate", { p_course_id: data.courseId });
    setBusy(false);
    if (err) setMsg({ ok: false, text: err.message });
    else { setMsg({ ok: true, text: "Sertifikat berildi!" }); reload(); }
  };

  if (loading) return <div className="container-page"><Spinner /></div>;
  if (error) return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;

  return (
    <div className="container-page max-w-3xl space-y-6 py-12">
      <h1 className="text-3xl font-bold">Sertifikatlar</h1>
      {data?.certs.length === 0 ? (
        <EmptyState title="Sizda hali sertifikat yo‘q" hint="Barcha 35 mavzuni yakunlab, yakuniy testdan o‘tgach sertifikat olishingiz mumkin.">
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button onClick={issue} disabled={busy}><Award className="h-4 w-4" /> Sertifikat olish</Button>
            <Link to="/yakuniy-test" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold dark:border-navy-700">Yakuniy test</Link>
          </div>
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {data?.certs.map((c) => (
            <li key={c.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{c.certificate_no}</p>
                <p className="text-sm text-slate-500">Berilgan sana: {formatDate(c.issued_at)}{c.final_percent != null ? ` · Yakuniy test: ${c.final_percent}%` : ""}</p>
              </div>
              <Link to={`/sertifikat/${c.verify_code}`} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">Ko‘rish va PDF</Link>
            </li>
          ))}
        </ul>
      )}
      {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-secondary" : "text-red-600"}`}>{msg.text}</p>}
    </div>
  );
}
