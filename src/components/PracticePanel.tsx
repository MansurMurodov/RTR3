import { useState } from "react";
import { Send } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../lib/supabase";
import { unwrap, useAsync } from "../lib/useAsync";
import type { CodeBundle, PracticalTask } from "../lib/types";
import CodeEditor from "./CodeEditor";
import { Button } from "./ui/Button";
import { Link } from "react-router-dom";

interface Submission { id: string; status: string; score: number | null; teacher_comment: string | null; submitted_at: string }

function TaskCard({ task, assignmentId, lessonId, index }: { task: PracticalTask; assignmentId: string | null; lessonId: string; index: number }) {
  const { session } = useAuth();
  const [code, setCode] = useState<CodeBundle>(task.starter_code);
  const [showSolution, setShowSolution] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const sub = useAsync(async () => {
    if (!assignmentId || !session) return null;
    const res = await supabase.from("assignment_submissions").select("id,status,score,teacher_comment,submitted_at")
      .eq("assignment_id", assignmentId).eq("user_id", session.user.id).maybeSingle();
    return unwrap(res) as Submission | null;
  }, [assignmentId, session?.user.id]);

  const submit = async () => {
    if (!assignmentId || !session) return;
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("assignment_submissions")
      .upsert({ assignment_id: assignmentId, user_id: session.user.id, code }, { onConflict: "assignment_id,user_id" });
    if (error) { setMsg({ ok: false, text: error.message }); setBusy(false); return; }
    await supabase.rpc("set_lesson_step", { p_lesson_id: lessonId, p_step: "practice" });
    setMsg({ ok: true, text: "Topshiriq yuborildi" });
    setBusy(false);
    sub.reload();
  };

  const s = sub.data;
  return (
    <article className="card space-y-4">
      <header>
        <h3 className="text-lg font-semibold">{index}. {task.title}</h3>
        {task.goal && <p className="text-sm text-slate-600 dark:text-slate-300"><b>Maqsad:</b> {task.goal}</p>}
      </header>
      {task.steps_md && <div><h4 className="font-medium">Bajarish bosqichlari</h4><p className="whitespace-pre-wrap text-sm leading-relaxed">{task.steps_md}</p></div>}

      <CodeEditor value={code} onChange={setCode} initial={task.starter_code} />

      {task.expected_result && <p className="text-sm"><b>Kutiladigan natija:</b> {task.expected_result}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={() => setShowSolution((v) => !v)}>{showSolution ? "Yechimni yashirish" : "Tayyor kod namunasini ko‘rsatish"}</Button>
        {assignmentId && (session
          ? <Button onClick={submit} disabled={busy}><Send className="h-4 w-4" /> Topshiriqni yuborish</Button>
          : <span className="text-sm text-slate-500"><Link to="/kirish" className="text-primary underline">Kiring</Link> – topshiriqni yuborish uchun</span>)}
      </div>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-secondary" : "text-red-600"}`}>{msg.text}</p>}

      {s && (
        <p className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-navy-900">
          Holat: <b>{s.status === "graded" ? "Baholangan" : "Yuborilgan"}</b>
          {s.score != null && <> · Ball: <b>{s.score}</b></>}
          {s.teacher_comment && <><br />O‘qituvchi izohi: {s.teacher_comment}</>}
        </p>
      )}

      {showSolution && (
        <div className="space-y-2">
          {(["html", "css", "js"] as const).filter((k) => task.solution_code[k]?.trim()).map((k) => (
            <div key={k}><p className="text-xs font-semibold uppercase text-slate-500">{k}</p>
              <pre className="overflow-x-auto rounded-xl bg-navy-900 p-3 font-mono text-xs text-slate-100">{task.solution_code[k]}</pre></div>
          ))}
          {task.code_explanation && <p className="text-sm"><b>Kod izohi:</b> {task.code_explanation}</p>}
        </div>
      )}

      {task.independent_task && (
        <div className="rounded-xl border border-dashed border-accent p-3 text-sm"><b>Mustaqil bajarish uchun topshiriq:</b> {task.independent_task}</div>
      )}
    </article>
  );
}

export default function PracticePanel({ lessonId, tasks, assignments }: { lessonId: string; tasks: PracticalTask[]; assignments: { id: string; practical_task_id: string | null }[] }) {
  return (
    <div className="space-y-6">
      {tasks.map((t, i) => (
        <TaskCard key={t.id} task={t} lessonId={lessonId} index={i + 1}
          assignmentId={assignments.find((a) => a.practical_task_id === t.id)?.id ?? null} />
      ))}
    </div>
  );
}
