import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";

export function Spinner({ label = "Yuklanmoqda…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin" /> {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="card flex flex-col items-center gap-3 py-10 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500" />
      <p className="font-medium">Ma’lumotni yuklab bo‘lmadi</p>
      <p className="max-w-md text-sm text-slate-500">{message}</p>
      {onRetry && <Button variant="ghost" onClick={onRetry}>Qayta urinish</Button>}
    </div>
  );
}

export function EmptyState({ title, hint, children }: { title: string; hint?: string; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-2 py-10 text-center">
      <Inbox className="h-8 w-8 text-slate-400" />
      <p className="font-medium">{title}</p>
      {hint && <p className="max-w-md text-sm text-slate-500">{hint}</p>}
      {children}
    </div>
  );
}
