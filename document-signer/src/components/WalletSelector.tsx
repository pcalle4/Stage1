import Button from "./ui/Button";
import { useWallet } from "../hooks/useWallet";

export default function WalletSelector() {
  const { accounts, selectedAccount, selectAccount, isConnected } = useWallet();

  if (!isConnected || accounts.length < 2) return null;

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-3 text-xs text-slate-800 shadow-sm dark:border-white/15 dark:bg-white/5 dark:text-slate-100">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Seleccionar cuenta
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {accounts.map((acc) => (
          <Button
            key={acc}
            size="sm"
            variant={selectedAccount === acc ? "primary" : "secondary"}
            onClick={() => selectAccount(acc)}
            className="font-mono text-[11px]"
          >
            {acc.slice(0, 6)}...{acc.slice(-4)}
          </Button>
        ))}
      </div>
    </div>
  );
}
