import clsx from "clsx";
import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 hover:from-sky-400 hover:to-cyan-300",
  secondary:
    "bg-slate-900/10 text-slate-900 hover:bg-slate-900/15 dark:bg-white/10 dark:text-slate-50 dark:hover:bg-white/15",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-900/10 dark:text-slate-200 dark:hover:bg-white/10",
  danger: "bg-rose-500 text-white hover:bg-rose-400",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm md:text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="mr-2 h-3 w-3 animate-spin rounded-full border border-slate-200 border-t-transparent" />
      )}
      {children}
    </button>
  );
}
