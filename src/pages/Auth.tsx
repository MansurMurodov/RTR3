import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { supabase } from "../lib/supabase";

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container-page grid place-items-center py-14">
      <div className="card w-full max-w-md space-y-5">
        <h1 className="text-2xl font-bold">{title}</h1>
        {children}
      </div>
    </div>
  );
}

function Notice({ ok, text }: { ok: boolean; text: string }) {
  return <p role={ok ? "status" : "alert"} className={`rounded-xl px-3 py-2 text-sm ${ok ? "bg-teal-50 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200"}`}>{text}</p>;
}

const errorText = (m: string) =>
  /invalid login/i.test(m) ? "Email yoki parol noto‘g‘ri" :
  /already registered|already exists/i.test(m) ? "Bu email allaqachon ro‘yxatdan o‘tgan" :
  /email not confirmed/i.test(m) ? "Emailingizni tasdiqlang (pochtangizni tekshiring)" :
  /password/i.test(m) ? "Parol kamida 8 ta belgidan iborat bo‘lishi kerak" : m;

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/kabinet";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) setError(errorText(err.message)); else navigate(from, { replace: true });
  };

  return (
    <Shell title="Tizimga kirish">
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label" htmlFor="password">Parol</label><input id="password" type="password" required autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <Notice ok={false} text={error} />}
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Kirilmoqda…" : "Kirish"}</Button>
      </form>
      <div className="flex justify-between text-sm">
        <Link to="/parolni-tiklash" className="text-primary hover:underline">Parolni unutdingizmi?</Link>
        <Link to="/royxatdan-otish" className="text-primary hover:underline">Ro‘yxatdan o‘tish</Link>
      </div>
    </Shell>
  );
}

export function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Parol kamida 8 ta belgidan iborat bo‘lishi kerak"); return; }
    setBusy(true); setError(null); setInfo(null);
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { full_name: fullName.trim() }, emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (err) { setError(errorText(err.message)); return; }
    if (data.session) navigate("/kabinet", { replace: true });
    else setInfo("Ro‘yxatdan o‘tdingiz. Emailingizga yuborilgan havola orqali hisobni tasdiqlang, so‘ng tizimga kiring.");
  };

  return (
    <Shell title="Ro‘yxatdan o‘tish">
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label" htmlFor="name">Ism va familiya</label><input id="name" required autoComplete="name" className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label" htmlFor="password">Parol (kamida 8 belgi)</label><input id="password" type="password" required minLength={8} autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <Notice ok={false} text={error} />}
        {info && <Notice ok text={info} />}
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Yuborilmoqda…" : "Ro‘yxatdan o‘tish"}</Button>
      </form>
      <p className="text-sm">Hisobingiz bormi? <Link to="/kirish" className="text-primary hover:underline">Kirish</Link></p>
    </Shell>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null); setInfo(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/yangi-parol` });
    setBusy(false);
    if (err) setError(errorText(err.message)); else setInfo("Agar bu email ro‘yxatdan o‘tgan bo‘lsa, parolni tiklash havolasi yuborildi.");
  };

  return (
    <Shell title="Parolni tiklash">
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        {error && <Notice ok={false} text={error} />}
        {info && <Notice ok text={info} />}
        <Button type="submit" className="w-full" disabled={busy}>Havola yuborish</Button>
      </form>
      <Link to="/kirish" className="text-sm text-primary hover:underline">Kirishga qaytish</Link>
    </Shell>
  );
}

export function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Parol kamida 8 ta belgidan iborat bo‘lishi kerak"); return; }
    setBusy(true); setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) setError(errorText(err.message)); else setDone(true);
  };

  return (
    <Shell title="Yangi parol">
      {done ? (
        <><Notice ok text="Parol yangilandi." /><Link to="/kabinet" className="text-primary hover:underline">Kabinetga o‘tish</Link></>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label" htmlFor="pw">Yangi parol</label><input id="pw" type="password" required minLength={8} autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error && <Notice ok={false} text={error} />}
          <Button type="submit" className="w-full" disabled={busy}>Saqlash</Button>
        </form>
      )}
    </Shell>
  );
}
