export default function ConfigMissing() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="card max-w-lg space-y-3">
        <h1 className="text-xl font-bold">Supabase sozlanmagan</h1>
        <p className="text-sm">
          Loyiha ildizida <code className="font-mono">.env</code> fayl yarating (namuna: <code className="font-mono">.env.example</code>) va
          quyidagilarni kiriting:
        </p>
        <pre className="overflow-x-auto rounded-xl bg-slate-100 p-3 font-mono text-xs dark:bg-navy-900">
{`VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...`}
        </pre>
        <p className="text-sm text-slate-500">So‘ng dev serverni qayta ishga tushiring.</p>
      </div>
    </div>
  );
}
