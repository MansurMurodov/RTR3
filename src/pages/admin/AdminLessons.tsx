import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { ErrorState, Spinner } from "../../components/ui/State";
import { supabase } from "../../lib/supabase";
import { unwrap, useAsync } from "../../lib/useAsync";

interface Row { id: string; number: number; title: string; hours: number; objective: string | null; is_published: boolean }
interface Theory { id: string; position: number; title: string; content_md: string }

function Editor({ lesson, onDone }: { lesson: Row; onDone: () => void }) {
  const [form, setForm] = useState({ title: lesson.title, hours: lesson.hours, objective: lesson.objective ?? "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<Theory>>>({});
  const theory = useAsync(async () => unwrap(await supabase.from("lesson_theory").select("id,position,title,content_md").eq("lesson_id", lesson.id).order("position")) as Theory[], [lesson.id]);

  const save = async () => {
    const { error } = await supabase.from("lessons").update({ title: form.title.trim(), hours: Number(form.hours), objective: form.objective.trim() || null }).eq("id", lesson.id);
    setMsg(error ? error.message : "Saqlandi"); if (!error) onDone();
  };
  const saveBlock = async (b: Theory) => {
    const d = drafts[b.id] ?? {};
    const { error } = await supabase.from("lesson_theory").update({ title: d.title ?? b.title, content_md: d.content_md ?? b.content_md }).eq("id", b.id);
    setMsg(error ? error.message : "Nazariya bloki saqlandi");
  };
  const addBlock = async () => {
    const pos = (theory.data?.length ?? 0) + 1;
    const { error } = await supabase.from("lesson_theory").insert({ lesson_id: lesson.id, position: pos, title: "Yangi blok", content_md: "Matn…" });
    if (error) setMsg(error.message); else theory.reload();
  };
  const delBlock = async (id: string) => {
    if (!confirm("Bu nazariya blokini o‘chirasizmi?")) return;
    const { error } = await supabase.from("lesson_theory").delete().eq("id", id);
    if (error) setMsg(error.message); else theory.reload();
  };
  const setBlock = (id: string, patch: Partial<Theory>) => { setMsg(null); setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } })); };

  return (
    <div className="card space-y-4">
      <h2 className="font-semibold">{lesson.number}-mavzuni tahrirlash</h2>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-3"><label className="label">Nomi</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div><label className="label">Soat</label><input type="number" min={1} className="input" value={form.hours} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} /></div>
      </div>
      <div><label className="label">Dars maqsadi</label><textarea className="input" rows={2} value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} /></div>
      <Button onClick={save}>Saqlash</Button>
      <h3 className="pt-2 font-semibold">Nazariy bloklar</h3>
      {theory.loading ? <Spinner /> : theory.data?.map((b) => (
        <div key={b.id} className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-navy-700">
          <input className="input" defaultValue={b.title} onChange={(e) => setBlock(b.id, { title: e.target.value })} />
          <textarea className="input font-mono text-xs" rows={5} defaultValue={b.content_md} onChange={(e) => setBlock(b.id, { content_md: e.target.value })} />
          <div className="flex gap-2"><Button variant="secondary" onClick={() => saveBlock(b)}>Saqlash</Button><Button variant="danger" onClick={() => delBlock(b.id)}><Trash2 className="h-4 w-4" /></Button></div>
        </div>
      ))}
      <Button variant="ghost" onClick={addBlock}><Plus className="h-4 w-4" /> Blok qo‘shish</Button>
      {msg && <p role="status" className="text-sm text-secondary">{msg}</p>}
    </div>
  );
}

export default function AdminLessons() {
  const [editing, setEditing] = useState<Row | null>(null);
  const { data, loading, error, reload } = useAsync(async () =>
    unwrap(await supabase.from("lessons").select("id,number,title,hours,objective,is_published").order("number")) as Row[], []);

  const toggle = async (r: Row) => {
    await supabase.from("lessons").update({ is_published: !r.is_published }).eq("id", r.id);
    reload();
  };

  if (loading) return <div className="container-page"><Spinner /></div>;
  if (error) return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;
  return (
    <div className="container-page space-y-6 py-12">
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">Mavzular boshqaruvi</h1><Link to="/admin" className="text-sm text-primary underline">Panelga qaytish</Link></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ul className="space-y-2">
          {data?.map((r) => (
            <li key={r.id} className="card flex items-center gap-3 py-3">
              <span className="font-mono text-sm font-bold">{r.number}</span>
              <span className="flex-1 text-sm">{r.title}</span>
              <button aria-label="Nashr holati" onClick={() => toggle(r)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-navy-700">{r.is_published ? <Eye className="h-4 w-4 text-secondary" /> : <EyeOff className="h-4 w-4 text-slate-400" />}</button>
              <button aria-label="Tahrirlash" onClick={() => setEditing(r)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-navy-700"><Pencil className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
        {editing ? <Editor key={editing.id} lesson={editing} onDone={reload} /> : <div className="card text-sm text-slate-500">Tahrirlash uchun mavzuni tanlang.</div>}
      </div>
    </div>
  );
}
