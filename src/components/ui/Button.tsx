import { Link, type LinkProps } from "react-router-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark shadow-soft",
  secondary: "bg-secondary text-white hover:bg-teal-700",
  ghost: "border border-slate-300 bg-transparent hover:bg-slate-100 dark:border-navy-700 dark:hover:bg-navy-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
};
const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

export function ButtonLink({ variant = "primary", className = "", children, ...props }: LinkProps & { variant?: Variant; children: ReactNode }) {
  return (
    <Link className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
