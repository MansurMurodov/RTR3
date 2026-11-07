import { ErrorState, Spinner } from "../components/ui/State";
import { supabase } from "../lib/supabase";
import { unwrap, useAsync } from "../lib/useAsync";
import type { LearningMethod } from "../lib/types";

export default function Methods() {
  const { data, loading, error, reload } = useAsync(async () => {
    const res = await supabase.from("learning_methods").select("id,position,name,definition,procedure,suitable_topics,expected_result").order("position");
    return unwrap(res) as LearningMethod[];
  }, []);

  if (loading) return <div className="container-page"><Spinner /></div>;
  if (error) return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;

  return (
    <div className="container-page space-y-6 py-12">
      <h1 className="text-3xl font-bold">O‘qitish metodlari</h1>
      <ul className="grid gap-4 md:grid-cols-2">
        {data?.map((m) => (
          <li key={m.id} className="card space-y-2">
            <h2 className="font-semibold">{m.position}. {m.name}</h2>
            {m.definition && <p className="text-sm">{m.definition}</p>}
            {m.procedure && <p className="text-sm"><b>Qo‘llash tartibi:</b> {m.procedure}</p>}
            {m.suitable_topics && <p className="text-sm"><b>Mavzular:</b> {m.suitable_topics}</p>}
            {m.expected_result && <p className="text-sm text-secondary dark:text-secondary-light"><b>Natija:</b> {m.expected_result}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
