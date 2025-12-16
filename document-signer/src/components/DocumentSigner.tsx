import { useState } from "react";
import { getBytes } from "ethers";
import { useWallet } from "../hooks/useWallet";
import { useDocumentRegistry } from "../hooks/useContract";
import { useFileHash } from "../hooks/useFileHash";
import FileUploader from "./FileUploader";
import { getBrowserProvider } from "../utils/ethers";
import Button from "./ui/Button";
import Modal from "./ui/Modal";

export default function DocumentSigner() {
  const { isConnected, isCorrectNetwork } = useWallet();
  const contract = useDocumentRegistry();

  const { file, hash, isHashing, error: hashError, setFile, computeHash } =
    useFileHash();

  const [signature, setSignature] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const resetActionState = () => {
    setSignature(null);
    setTxHash(null);
    setActionError(null);
    setModalError(null);
  };

  const friendlyError = (err: any): string => {
    if (!err) return "Ocurrió un error inesperado";
    if (typeof err === "string") return err;
    const reason = err.reason || err.data?.message || err.error?.message || err.message;
    if (reason) {
      if (reason.includes("Document already stored")) return "El documento ya fue almacenado.";
      return reason;
    }
    return "No se pudo completar la acción";
  };

  const handleComputeHash = async () => {
    resetActionState();
    await computeHash();
  };

  const handleSign = async () => {
    if (!isConnected) return setActionError("Conecta tu wallet primero");
    if (!isCorrectNetwork) return setActionError("Red incorrecta (usa Anvil 31337)");
    if (!hash) return setActionError("Primero calcula el hash");

    setIsSigning(true);
    setActionError(null);
    setSignature(null);
    setTxHash(null);

    try {
      const provider = getBrowserProvider();
      const signer = await provider.getSigner();
      const hashBytes = getBytes(hash);
      const sig = await signer.signMessage(hashBytes);
      setSignature(sig);
    } catch (err: any) {
      console.error("Error al firmar:", err);
      const message = friendlyError(err) || "No se pudo firmar el documento";
      setActionError(message);
      setModalError(message);
    } finally {
      setIsSigning(false);
    }
  };

  const handleStore = async () => {
    if (!isConnected) return setActionError("Conecta tu wallet primero");
    if (!isCorrectNetwork) return setActionError("Red incorrecta (usa Anvil 31337)");
    if (!contract) return setActionError("Contrato no disponible");
    if (!hash || !signature) return setActionError("Calcula hash y firma antes de guardar");

    setIsStoring(true);
    setActionError(null);
    setTxHash(null);

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const tx = await contract.storeDocumentHash(hash, timestamp, signature);
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
    } catch (err: any) {
      console.error("Error al guardar en blockchain:", err);
      const message = friendlyError(err) || "No se pudo guardar el documento";
      setActionError(message);
      setModalError(message);
    } finally {
      setIsStoring(false);
    }
  };

  return (
    <div className="space-y-6">
      <Modal
        isOpen={!!modalError}
        onClose={() => setModalError(null)}
        title="Ocurrió un problema"
      >
        <p className="text-sm">{modalError}</p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Si ya guardaste este documento antes, no es necesario volver a almacenarlo.
        </p>
      </Modal>

      <section className="space-y-2 rounded-2xl border border-slate-200/60 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="pill bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-100">
              Paso 1
            </span>
            <h4 className="text-sm font-semibold">Archivo</h4>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-300">Selecciona tu archivo</span>
        </header>
        <FileUploader file={file} onFileChange={setFile} />
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200/60 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="pill bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-100">
              Paso 2
            </span>
            <h4 className="text-sm font-semibold">Hash</h4>
          </div>
          <Button onClick={handleComputeHash} loading={isHashing} size="sm">
            {isHashing ? "Calculando..." : "Calcular hash"}
          </Button>
        </header>
        {hash && (
          <div className="rounded-2xl border border-slate-200/60 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
            <span className="text-slate-500 dark:text-slate-300">Hash:</span> {hash}
          </div>
        )}
        {!hash && <p className="text-xs text-slate-500 dark:text-slate-300">Calcula el hash del archivo.</p>}
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200/60 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="pill bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-100">
              Paso 3
            </span>
            <h4 className="text-sm font-semibold">Firma</h4>
          </div>
          <Button onClick={handleSign} loading={isSigning} size="sm" variant="secondary">
            {isSigning ? "Firmando..." : "Firmar documento"}
          </Button>
        </header>
        {signature && (
          <div className="rounded-2xl border border-slate-200/60 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
            <span className="text-slate-500 dark:text-slate-300">Firma:</span> {signature}
          </div>
        )}
        {!signature && <p className="text-xs text-slate-500 dark:text-slate-300">Firma el hash con tu wallet.</p>}
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200/60 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="pill bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-100">
              Paso 4
            </span>
            <h4 className="text-sm font-semibold">Guardar en blockchain</h4>
          </div>
          <Button onClick={handleStore} loading={isStoring} size="sm" variant="primary">
            {isStoring ? "Guardando..." : "Guardar"}
          </Button>
        </header>
        {txHash && (
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-50">
            <span className="font-semibold">Documento almacenado.</span>{" "}
            <span className="font-mono">tx: {txHash}</span>
          </div>
        )}
        {!txHash && <p className="text-xs text-slate-500 dark:text-slate-300">Envía la transacción al contrato.</p>}
      </section>

      {(hashError || actionError) && (
        <p className="text-xs text-rose-500 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
          {hashError || actionError}
        </p>
      )}

      {!hash && !signature && !txHash && !hashError && !actionError && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sube un archivo, calcula el hash, firma y guarda en blockchain.
        </p>
      )}
    </div>
  );
}
