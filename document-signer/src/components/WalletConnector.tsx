import { clsx } from "clsx";
import { useWallet } from "../hooks/useWallet";
import Button from "./ui/Button";

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function WalletConnector() {
  const {
    address,
    chainId,
    isConnected,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  if (typeof window !== "undefined" && !window.ethereum) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-100">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        MetaMask no detectada
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Button variant="primary" size="sm" onClick={connectWallet} className="shadow-lg shadow-sky-500/30">
        <span className="text-[11px] font-semibold">Conectar wallet</span>
      </Button>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 rounded-full bg-white/90 px-3 py-2 text-xs text-slate-900 shadow-sm border border-slate-200/80 backdrop-blur dark:bg-white/10 dark:text-slate-100 dark:border-white/15">
      <div className="flex items-center gap-2">
        <span
          className={clsx(
            "h-2.5 w-2.5 rounded-full",
            isCorrectNetwork ? "bg-emerald-400" : "bg-rose-400",
          )}
        />
        <div className="flex flex-col leading-tight">
          <span className="font-semibold">{address ? formatAddress(address) : "Desconocida"}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-300">
            chainId {chainId ?? "?"} ({isCorrectNetwork ? "ok" : "incorrecta"})
          </span>
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={disconnectWallet} className="border border-slate-300/60 dark:border-white/20">
        <span className="text-[11px] font-semibold">Desconectar</span>
      </Button>
    </div>
  );
}
