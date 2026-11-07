import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, Eraser, Play, RotateCcw } from "lucide-react";
import type { CodeBundle } from "../lib/types";
import { Button } from "./ui/Button";

type Tab = "html" | "css" | "js";
const TABS: { id: Tab; label: string }[] = [
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "js", label: "JavaScript" },
];

const ERROR_HOOK =
  "<script>window.addEventListener('error',function(e){parent.postMessage({type:'edu-error',msg:(e.message||'Xatolik')+(e.lineno?' (qator '+e.lineno+')':'')},'*');});<\/script>";

export function buildDocument({ html, css, js }: CodeBundle): string {
  return `<!DOCTYPE html><html lang="uz"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{font-family:system-ui,sans-serif;margin:12px}${css}</style></head><body>${html}${ERROR_HOOK}<script>${js}<\/script></body></html>`;
}

interface Props {
  value: CodeBundle;
  onChange: (next: CodeBundle) => void;
  initial: CodeBundle;
}

export default function CodeEditor({ value, onChange, initial }: Props) {
  const [tab, setTab] = useState<Tab>("html");
  const [runDoc, setRunDoc] = useState(() => buildDocument(value));
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frameRef.current?.contentWindow) return;
      const data = e.data as { type?: string; msg?: string } | null;
      if (data?.type === "edu-error" && typeof data.msg === "string") {
        setErrors((prev) => (prev.length < 20 ? [...prev, data.msg as string] : prev));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const run = useCallback(() => {
    setErrors([]);
    setRunDoc(buildDocument(value));
  }, [value]);

  const flash = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(null), 2000);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value[tab]);
      flash("Nusxalandi");
    } catch {
      flash("Nusxalab bo‘lmadi");
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([buildDocument(value)], { type: "text/html;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const lineCount = useMemo(() => value[tab].split("\n").length, [value, tab]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Kod bo‘limlari" className="flex rounded-xl bg-slate-200 p-1 dark:bg-navy-700">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === t.id ? "bg-white shadow dark:bg-navy-900" : ""}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button onClick={run}><Play className="h-4 w-4" /> Run</Button>
          <Button variant="ghost" onClick={copy}><Copy className="h-4 w-4" /> Nusxalash</Button>
          <Button variant="ghost" onClick={download}><Download className="h-4 w-4" /> Yuklab olish</Button>
          <Button variant="ghost" onClick={() => onChange({ ...value, [tab]: "" })}><Eraser className="h-4 w-4" /> Tozalash</Button>
          <Button variant="ghost" onClick={() => { onChange(initial); setErrors([]); }}><RotateCcw className="h-4 w-4" /> Boshlang‘ich</Button>
        </div>
      </div>
      {notice && <p role="status" className="text-sm text-secondary">{notice}</p>}

      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <textarea
            aria-label={`${tab.toUpperCase()} kodi`}
            value={value[tab]}
            onChange={(e) => onChange({ ...value, [tab]: e.target.value })}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(); }
            }}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="h-72 w-full resize-y rounded-xl border border-slate-300 bg-navy-900 p-3 font-mono text-xs leading-relaxed text-slate-100 outline-none focus:border-primary dark:border-navy-700"
          />
          <p className="mt-1 text-xs text-slate-500">{lineCount} qator · Ctrl+Enter – ishga tushirish</p>
        </div>
        <div>
          <iframe
            ref={frameRef}
            title="Natija (Preview)"
            sandbox="allow-scripts"
            srcDoc={runDoc}
            className="h-72 w-full rounded-xl border border-slate-300 bg-white dark:border-navy-700"
          />
          <p className="mt-1 text-xs text-slate-500">Natija izolyatsiyalangan (sandbox) oynada ishlaydi.</p>
        </div>
      </div>

      {errors.length > 0 && (
        <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          <p className="font-semibold">Xatolar:</p>
          <ul className="list-disc pl-5 font-mono text-xs">{errors.map((er, i) => <li key={i}>{er}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
