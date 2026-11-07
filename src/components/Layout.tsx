import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { useTheme } from "../lib/theme";
import { ButtonLink } from "./ui/Button";

const links = [
  { to: "/", label: "Bosh sahifa", end: true },
  { to: "/kurs-haqida", label: "Kurs haqida" },
  { to: "/oquv-dasturi", label: "O‘quv dasturi" },
  { to: "/metodlar", label: "Metodlar" },
  { to: "/taqdimotlar", label: "Taqdimotlar" },
  { to: "/loyihalar", label: "Loyihalar" },
  { to: "/glossariy", label: "Glossariy" },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { session, profile, isTeacherUp, signOut } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? "bg-primary/10 text-primary dark:text-primary-light" : "hover:bg-slate-100 dark:hover:bg-navy-700"
    }`;

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="print:hidden sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-navy-700 dark:bg-navy-900/80">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-violet-500 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            FRONTEND <span className="text-primary dark:text-primary-light">EDU</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Asosiy menyu">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggle} aria-label="Mavzuni almashtirish" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-navy-700">
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="hidden items-center gap-2 lg:flex">
              {session ? (
                <>
                  {isTeacherUp && <ButtonLink to="/admin" variant="ghost">Boshqaruv</ButtonLink>}
                  <ButtonLink to="/kabinet" variant="ghost">{profile?.full_name || "Kabinet"}</ButtonLink>
                  <button onClick={handleSignOut} aria-label="Chiqish" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-navy-700">
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <ButtonLink to="/kirish" variant="ghost">Kirish</ButtonLink>
                  <ButtonLink to="/royxatdan-otish">Ro‘yxatdan o‘tish</ButtonLink>
                </>
              )}
            </div>
            <button onClick={() => setOpen((v) => !v)} aria-label="Menyu" aria-expanded={open} className="rounded-lg p-2 lg:hidden">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-slate-200 bg-white p-4 dark:border-navy-700 dark:bg-navy-900 lg:hidden">
            <nav className="flex flex-col gap-1" onClick={() => setOpen(false)}>
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>
              ))}
              {session ? (
                <>
                  {isTeacherUp && <NavLink to="/admin" className={linkClass}>Boshqaruv paneli</NavLink>}
                  <NavLink to="/kabinet" className={linkClass}>Mening kabinetim</NavLink>
                  <button onClick={handleSignOut} className="rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-slate-100 dark:hover:bg-navy-700">Chiqish</button>
                </>
              ) : (
                <>
                  <NavLink to="/kirish" className={linkClass}>Kirish</NavLink>
                  <NavLink to="/royxatdan-otish" className={linkClass}>Ro‘yxatdan o‘tish</NavLink>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="print:hidden border-t border-slate-200 py-6 text-center text-sm text-slate-500 dark:border-navy-700">
        FRONTEND EDU – 70 soatlik raqamli ta’lim resursi · Muallif: Mansur Murodov
      </footer>
    </div>
  );
}
