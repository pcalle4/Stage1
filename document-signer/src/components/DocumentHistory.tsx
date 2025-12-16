import { useEffect, useState } from "react";
import { Interface } from "ethers";
import { getBrowserProvider } from "../utils/ethers";
import DocumentRegistryAbi from "../abi/DocumentRegistry.json";

type StoredDocument = {
  hash: string;
  signer: string;
  timestamp: number;
  signature: string;
  blockNumber: number;
  txHash: string;
};

function shortHex(value: string, chars = 6) {
  if (!value) return "";
  return `${value.slice(0, chars)}...${value.slice(-4)}`;
}

export default function DocumentHistory() {
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const provider = getBrowserProvider();
        const address = import.meta.env.VITE_CONTRACT_ADDRESS;
        if (!address) throw new Error("Falta VITE_CONTRACT_ADDRESS");

        const iface = new Interface(DocumentRegistryAbi);
        const eventFragment = iface.getEvent("DocumentStored");
        if (!eventFragment) throw new Error("Event DocumentStored not found in ABI");
        const topic = eventFragment.topicHash;

        const logs = await provider.getLogs({
          address,
          fromBlock: 0n,
          toBlock: "latest",
          topics: [topic],
        });

        const items: StoredDocument[] = logs
          .map((log) => {
            const parsed = iface.parseLog(log);
            if (!parsed) return null;
            const [hash, signer, timestamp, signature] = parsed.args;
            return {
              hash,
              signer,
              timestamp: Number(timestamp),
              signature,
              blockNumber: log.blockNumber,
              txHash: log.transactionHash,
            };
          })
          .filter((item): item is StoredDocument => item !== null)
          .reverse();

        setDocuments(items);
      } catch (err: any) {
        console.error("Error al cargar historial:", err);
        setLoadError(err?.message || "No se pudo cargar el historial");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="surface-card space-y-3">
      <h3 className="text-lg font-semibold">
        Historial de documentos almacenados
      </h3>

      {isLoading && <p className="text-sm text-slate-500 dark:text-slate-300">Cargando historial…</p>}
      {loadError && <p className="text-sm text-rose-500 dark:text-rose-300">{loadError}</p>}

      {!isLoading && !loadError && documents.length === 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-300">
          Aún no hay documentos almacenados. Firma uno en la sección anterior.
        </p>
      )}

      {!isLoading && !loadError && documents.length > 0 && (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={`${doc.hash}-${doc.txHash}`}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200/60 bg-white/85 px-3 py-2.5 text-xs md:text-sm shadow-sm dark:border-white/15 dark:bg-slate-900/40"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Hash
                  </p>
                  <p className="font-mono text-[11px] text-slate-800 dark:text-slate-100">
                    {shortHex(doc.hash)}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Signer
                  </p>
                  <p className="font-mono text-[11px] text-sky-700 dark:text-sky-300">
                    {shortHex(doc.signer)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Fecha
                  </p>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300">
                    {new Date(doc.timestamp * 1000).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Tx Hash
                  </p>
                  <p className="font-mono text-[10px] text-slate-500 dark:text-slate-500">
                    {shortHex(doc.txHash)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-300">
                <button
                  className="rounded-full border border-slate-300/70 bg-white/70 px-2 py-1 text-[10px] font-semibold text-slate-700 transition hover:border-sky-400 hover:text-slate-900 dark:border-white/20 dark:bg-white/10 dark:text-slate-100 dark:hover:border-sky-300"
                  onClick={() => {
                    navigator.clipboard.writeText(doc.hash);
                    setCopied(doc.hash);
                    setTimeout(() => setCopied(null), 1200);
                  }}
                >
                  Copiar hash
                </button>
                {copied === doc.hash && <span className="text-emerald-500 dark:text-emerald-300">Copiado</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
