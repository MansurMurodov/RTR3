import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../lib/supabase";
import { unwrap, useAsync } from "../lib/useAsync";
import { gradeLabel, type QuizMeta } from "../lib/types";
import { Button } from "./ui/Button";
import { Link } from "react-router-dom";

interface Q { id: string; position: number; body: string; multiple: boolean; points: number }
interface Opt { id: string; question_id: string; position: number; body: string }
interface ReviewItem { question_id: string; correct: boolean; selected_option_ids: string[]; correct_option_ids: string[]; explanation: string | null }
interface Result { attempt_id: string; expired: boolean; points: number; max_points: number; percent: number; grade: number; passed: boolean; review: ReviewItem[] }
interface Attempt { id: string; percent: number; grade: number | null; passed: boolean; submitted_at: string | null; status: string }

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

export default function QuizRunner({ quiz }: { quiz: QuizMeta }) {
  const { session } = useAuth();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [options, setOptions] = useState<Opt[]>([]);
  const [picked, setPicked] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState<number | null>(null);
  const submittedRef = useRef(false);

  const history = useAsync(async () => {
    if (!session) return [] as Attempt[];
    const res = await supabase.from("quiz_attempts").select("id,percent,grade,passed,submitted_at,status")
      .eq("quiz_id", quiz.id).neq("status", "in_progress").order("submitted_at", { ascending: false }).limit(5);
    return unwrap(res) as Attempt[];
  }, [quiz.id, session?.user.id]);

  const submit = useCallback(async (id: string, answers: Record<string, string[]>) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setBusy(true); setError(null);
    const payload = Object.entries(answers).map(([question_id, option_ids]) => ({ question_id, option_ids }));
    const { data, error: err } = await supabase.rpc("submit_quiz", { p_attempt_id: id, p_answers: payload });
    setBusy(false);
    if (err) { submittedRef.current = false; setError(err.message); return; }
    setResult(data as Result);
    setAttemptId(null);
    setLeft(null);
    history.reload();
  }, [history]);

  const start = async () => {
    setBusy(true); setError(null); setResult(null); setPicked({}); submittedRef.current = false;
    try {
      const { data: id, error: e1 } = await supabase.rpc("start_quiz", { p_quiz_id: quiz.id });
      if (e1) throw new Error(e1.message);
      const aid = id as string;
      const qrows = unwrap(await supabase.from("quiz_questions").select("id,position,body,multiple,points").eq("quiz_id", quiz.id).order("position")) as Q[];
      const qids = qrows.map((q) => q.id);
      const [os, att] = await Promise.all([
        supabase.from("quiz_options").select("id,question_id,position,body").in("question_id", qids).order("position"),
        supabase.from("quiz_attempts").select("started_at").eq("id", aid).single(),
      ]);
      setQuestions(qrows);
      setOptions(unwrap(os) as Opt[]);
      if (quiz.time_limit_minutes) {
        const startedAt = new Date((unwrap(att) as { started_at: string }).started_at).getTime();
        setLeft(Math.max(0, Math.round((startedAt + quiz.time_limit_minutes * 60000 - Date.now()) / 1000)));
      }
      setAttemptId(aid);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Testni boshlab bo‘lmadi");
    }
    setBusy(false);
  };

  useEffect(() => {
    if (left === null || !attemptId) return;
    if (left <= 0) { void submit(attemptId, picked); return; }
    const t = window.setTimeout(() => setLeft((s) => (s === null ? s : s - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [left, attemptId, picked, submit]);

  const toggle = (q: Q, optId: string) => {
    setPicked((prev) => {
      const cur = prev[q.id] ?? [];
      if (!q.multiple) return { ...prev, [q.id]: [optId] };
      return { ...prev, [q.id]: cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId] };
    });
  };

  if (!session) {
    return <div className="card text-sm">Testni topshirish uchun <Link to="/kirish" className="text-primary underline">tizimga kiring</Link>.</div>;
  }

  if (result) {
    const byQ = new Map(result.review.map((r) => [r.question_id, r]));
    return (
      <div className="space-y-4">
        <div className={`card ${result.passed ? "border-secondary" : "border-red-400"}`}>
          <h3 className="text-xl font-bold">{result.passed ? "Test muvaffaqiyatli topshirildi" : result.expired ? "Vaqt tugadi" : "Test topshirildi"}</h3>
          <p className="mt-1">Natija: <b>{result.percent}%</b> ({result.points} / {result.max_points} ball) · Baho: <b>{gradeLabel[result.grade]}</b></p>
          {!result.passed && <p className="text-sm text-slate-500">O‘tish chegarasi: {quiz.pass_percent}%. Testni qayta topshirishingiz mumkin.</p>}
        </div>
        {questions.map((q, i) => {
          const r = byQ.get(q.id);
          const opts = options.filter((o) => o.question_id === q.id);
          return (
            <div key={q.id} className="card space-y-2">
              <p className="flex items-start gap-2 font-medium">
                {r?.correct ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />}
                {i + 1}. {q.body}
              </p>
              <ul className="space-y-1 text-sm">
                {opts.map((o) => {
                  const isCorrect = r?.correct_option_ids.includes(o.id);
                  const wasPicked = r?.selected_option_ids.includes(o.id);
                  return (
                    <li key={o.id} className={`rounded-lg px-3 py-1.5 ${isCorrect ? "bg-teal-100 dark:bg-teal-900/40" : wasPicked ? "bg-red-100 dark:bg-red-900/40" : ""}`}>
                      {o.body}{isCorrect && " ✓"}{wasPicked && !isCorrect && " ✗"}
                    </li>
                  );
                })}
              </ul>
              {r?.explanation && <p className="text-sm text-slate-500">Izoh: {r.explanation}</p>}
            </div>
          );
        })}
        <Button onClick={start} disabled={busy}>Testni qayta topshirish</Button>
      </div>
    );
  }

  if (attemptId) {
    return (
      <div className="space-y-4">
        <div className="sticky top-16 z-10 flex items-center justify-between rounded-xl bg-white/90 p-3 shadow backdrop-blur dark:bg-navy-800/90">
          <span className="text-sm">Javob berilgan: {Object.values(picked).filter((v) => v.length).length} / {questions.length}</span>
          {left !== null && <span className={`font-mono text-sm font-bold ${left < 60 ? "text-red-600" : ""}`} aria-live="off">{fmt(left)}</span>}
        </div>
        {questions.map((q, i) => (
          <fieldset key={q.id} className="card space-y-2">
            <legend className="px-1 font-medium">{i + 1}. {q.body}</legend>
            <p className="text-xs text-slate-500">{q.multiple ? "Bir nechta javobni belgilang" : "Bitta javobni tanlang"}</p>
            {options.filter((o) => o.question_id === q.id).map((o) => (
              <label key={o.id} className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-navy-700">
                <input type={q.multiple ? "checkbox" : "radio"} name={q.id} checked={(picked[q.id] ?? []).includes(o.id)} onChange={() => toggle(q, o.id)} className="mt-1" />
                <span>{o.body}</span>
              </label>
            ))}
          </fieldset>
        ))}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Button onClick={() => void submit(attemptId, picked)} disabled={busy}>Testni yakunlash</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-2">
        <h3 className="text-lg font-semibold">{quiz.title}</h3>
        {quiz.description && <p className="text-sm">{quiz.description}</p>}
        <p className="text-sm text-slate-500">O‘tish chegarasi: {quiz.pass_percent}%{quiz.time_limit_minutes ? ` · Vaqt: ${quiz.time_limit_minutes} daqiqa` : ""}</p>
        <p className="text-xs text-slate-500">To‘g‘ri javoblar test tugagandan keyin ko‘rsatiladi.</p>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Button onClick={start} disabled={busy}>{busy ? "Yuklanmoqda…" : "Testni boshlash"}</Button>
      </div>
      {history.data && history.data.length > 0 && (
        <div className="card">
          <h4 className="mb-2 font-semibold">Oldingi urinishlar</h4>
          <ul className="space-y-1 text-sm">
            {history.data.map((a) => (
              <li key={a.id} className="flex justify-between"><span>{a.submitted_at ? new Date(a.submitted_at).toLocaleString("uz-UZ") : "—"}</span>
                <span className="font-mono">{a.percent}% · {a.grade ? gradeLabel[a.grade] : "—"}{a.passed ? " ✓" : ""}</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
