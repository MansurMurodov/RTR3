import { Link } from "react-router-dom";
import { ErrorState, Spinner } from "../../components/ui/State";
import { supabase } from "../../lib/supabase";
import { useAsync } from "../../lib/useAsync";

const tables = [
  { table: "profiles", label: "Jami foydalanuvchilar" },
  { table: "lessons", label: "Jami mavzular" },
  { table: "quizzes", label: "Jami testlar" },
  { table: "media_materials", label: "Media materiallar" },
  { table: "quiz_attempts", label: "Test urinishlari" },
] as const;

export default function AdminDashboard() {
  const { data, loading, error, reload } = useAsync(async () => {
    const counts = await Promise.all(
      tables.map(async ({ table }) => {
        const { count, error: err } = await supabase.from(table).select("id", { count: "exact", head: true });
        if (err) throw new Error(err.message);
        return count ?? 0;
      }),
    );
    return counts;
  }, []);

  if (loading) return <div className="container-page"><Spinner /></div>;
  if (error) return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;

  return (
    <div className="container-page space-y-6 py-12">
      <h1 className="text-3xl font-bold">Boshqaruv paneli</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((t, i) => (
          <li key={t.table} className="card">
            <p className="text-sm text-slate-500">{t.label}</p>
            <p className="mt-1 text-3xl font-bold">{data?.[i] ?? 0}</p>
          </li>
        ))}
      </ul>
      <Link to="/admin/mavzular" className="card inline-block font-semibold text-primary hover:border-primary">Mavzular boshqaruvi →</Link>
    </div>
  );
}
