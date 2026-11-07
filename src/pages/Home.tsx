import { motion } from "framer-motion";
import { BookOpenCheck, Clock, Code2, Layers, ListChecks } from "lucide-react";
import { ButtonLink } from "../components/ui/Button";
import { useAsync, unwrap } from "../lib/useAsync";
import { supabase } from "../lib/supabase";
import type { Course } from "../lib/types";

export default function Home() {
  const { data: course } = useAsync(async () => {
    const res = await supabase.from("courses").select("id,slug,title,description,goal,total_hours,author_name").eq("slug", "frontend-edu").maybeSingle();
    return unwrap(res) as Course | null;
  }, []);
  const { data: lessonCount } = useAsync(async () => {
    const { count, error } = await supabase.from("lessons").select("id", { count: "exact", head: true });
    if (error) throw new Error(error.message);
    return count ?? 0;
  }, []);

  const stats = [
    { icon: Clock, label: `${course?.total_hours ?? 70} soatlik ta’lim` },
    { icon: Layers, label: `${lessonCount ?? 35} ta mavzu` },
    { icon: BookOpenCheck, label: "Nazariy va amaliy mashg‘ulotlar" },
    { icon: ListChecks, label: "Test va baholash" },
    { icon: Code2, label: "Interaktiv kod muhiti" },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-navy-900 dark:via-navy-900 dark:to-navy-800">
        <div className="container-page py-16 sm:py-24">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-accent-light">
              Raqamli ta’lim resursi
            </span>
            <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Frontend dasturlashni noldan o‘rganing!</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              HTML, CSS, JavaScript va zamonaviy web texnologiyalarini nazariya va amaliyot orqali o‘rganing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/royxatdan-otish">Ta’limni boshlash</ButtonLink>
              <ButtonLink to="/oquv-dasturi" variant="ghost">O‘quv dasturini ko‘rish</ButtonLink>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-page -mt-6 pb-16">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map(({ icon: Icon, label }, i) => (
            <motion.li key={label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="card flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary dark:text-primary-light"><Icon className="h-5 w-5" /></span>
              <span className="text-sm font-semibold">{label}</span>
            </motion.li>
          ))}
        </ul>
      </section>
    </>
  );
}
