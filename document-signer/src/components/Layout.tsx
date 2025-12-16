import { useEffect, useState } from "react";
import WalletConnector from "./WalletConnector";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const body = document.body;
    body.classList.remove("theme-dark", "theme-light");
    body.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const textPrimary = theme === "dark" ? "text-slate-50" : "text-slate-900";
  const textSecondary = theme === "dark" ? "text-slate-400" : "text-slate-600";
  const mainCard =
    theme === "dark"
      ? "glass-card text-slate-50"
      : "rounded-3xl border border-slate-200/70 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl text-slate-900";

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-semibold tracking-tight ${textPrimary}`}>
              document<span className="text-sky-400">-signer</span>
            </h1>
            <p className={`text-xs md:text-sm ${textSecondary}`}>
              Firma y verifica documentos sobre Ethereum (Anvil)
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-sky-400 hover:text-slate-900 dark:border-white/20 dark:bg-white/10 dark:text-slate-100 dark:shadow-inner dark:shadow-white/5"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  theme === "dark" ? "bg-amber-300" : "bg-slate-700"
                }`}
              />
              {theme === "dark" ? "Modo oscuro" : "Modo claro"}
            </button>
            <WalletConnector />
          </div>
        </header>

        <main className={`${mainCard} p-4 md:p-6 space-y-8`}>
          {children}
        </main>
      </div>
    </div>
  );
}
