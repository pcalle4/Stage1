import { useState } from "react";
import { getBytes, getAddress, verifyMessage } from "ethers";
import { useWallet } from "../hooks/useWallet";
import { useDocumentRegistry } from "../hooks/useContract";
import { useFileHash } from "../hooks/useFileHash";
import FileUploader from "./FileUploader";
import Button from "./ui/Button";

function shortHex(value: string, chars = 6) {
  if (!value) return "";
  return `${value.slice(0, chars)}...${value.slice(-4)}`;
}

export default function DocumentVerifier() {
  const { isConnected, isCorrectNetwork } = useWallet();
  const contract = useDocumentRegistry();
  const { file, hash, isHashing, error: hashError, setFile, computeHash } = useFileHash();

  const [inputSigner, setInputSigner] = useState<string>("");
  const [contractSigner, setContractSigner] = useState<string>("");
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [storedSignature, setStoredSignature] = useState<string | null>(null);
  const [onChainValid, setOnChainValid] = useState<boolean | null>(null);
  const [offChainValid, setOffChainValid] = useState<boolean | null>(null);
  const [recoveredAddress, setRecoveredAddress] = useState<string | null>(null);
  const [signerMismatch, setSignerMismatch] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const resetResults = () => {
    setContractSigner("");
    setTimestamp(null);
    setStoredSignature(null);
    setOnChainValid(null);
    setOffChainValid(null);
    setRecoveredAddress(null);
    setSignerMismatch(null);
    setVerifyError(null);
  };

  const handleComputeHash = async () => {
    resetResults();
    await computeHash();
  };

  const handleVerify = async () => {
    resetResults();
    if (!isConnected) {
      setVerifyError("Conecta tu wallet primero");
      return;
    }
    if (!isCorrectNetwork) {
      setVerifyError("Red incorrecta (usa Anvil 31337)");
      return;
    }
    if (!contract) {
      setVerifyError("Contrato no disponible");
      return;
    }
    if (!hash) {
      setVerifyError("Primero calcula el hash");
      return;
    }
    let normalizedSigner: string;
    try {
      normalizedSigner = getAddress(inputSigner.trim());
    } catch {
      setVerifyError("Dirección de firmante no válida");
      return;
    }

    setIsVerifying(true);
    try {
      // Paso 1: verificar si el hash existe on-chain.
      const exists: boolean = await contract.isDocumentStored(hash);
      if (!exists) {
        setVerifyError("El documento no está almacenado en la blockchain");
        return;
      }

      const doc = await contract.getDocumentInfo(hash);
      setContractSigner(doc.signer);
      setTimestamp(Number(doc.timestamp));
      setStoredSignature(doc.signature);

      // Paso 2: verificación on-chain usando el contrato.
      const isOnChainValid: boolean = await contract.verifyDocument(hash, normalizedSigner, doc.signature);
      const signerMatches = doc.signer.toLowerCase() === normalizedSigner.toLowerCase();
      setOnChainValid(isOnChainValid && signerMatches);
      if (!signerMatches) {
        setSignerMismatch("La dirección ingresada no coincide con el signer almacenado on-chain.");
      }

      // Paso 3: verificación off-chain recuperando la dirección desde la firma.
      const recovered = verifyMessage(getBytes(hash), doc.signature);
      setRecoveredAddress(recovered);
      const isOffChainValid = recovered.toLowerCase() === normalizedSigner.toLowerCase();
      setOffChainValid(isOffChainValid);
    } catch (err: any) {
      console.error("Error al verificar:", err);
      setVerifyError(err?.message || "No se pudo verificar el documento");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="surface-card space-y-4">
      <h3 className="text-lg font-semibold">Verificar documento</h3>

      <div className="space-y-3">
        <p className="text-xs text-slate-500 dark:text-slate-300">
          Sube el archivo original, ingresa la dirección que firmó y verifica on-chain y off-chain.
        </p>
        <FileUploader file={file} onFileChange={setFile} />

        <div className="space-y-2">
          <label className="block text-sm font-semibold">
            Dirección firmante esperada
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={inputSigner}
            onChange={(e) => setInputSigner(e.target.value)}
            className="w-full rounded-xl border border-slate-300/40 bg-white/70 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-sky-400/60 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-slate-50"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleComputeHash} loading={isHashing} size="sm">
            {isHashing ? "Calculando..." : "Calcular hash"}
          </Button>
          <Button
            onClick={handleVerify}
            loading={isVerifying}
            size="sm"
            variant="secondary"
            disabled={!hash || !inputSigner || !isConnected || !isCorrectNetwork}
          >
            {isVerifying ? "Verificando..." : "Verificar documento"}
          </Button>
        </div>
      </div>

      {hash && (
          <div className="rounded-2xl border border-slate-300/50 bg-white/70 px-3 py-2 text-xs font-mono text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
            <span className="text-slate-500 dark:text-slate-300">Hash:</span> {hash}
          </div>
        )}

      {(hashError || verifyError) && (
        <p className="text-xs text-rose-500 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
          {hashError || verifyError}
        </p>
      )}
      {signerMismatch && (
        <p className="text-xs text-amber-600 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
          {/* Muestra cuando la dirección ingresada difiere del signer guardado. */}
          {signerMismatch}
        </p>
      )}

      <div className="space-y-2 text-sm">
        {contractSigner && (
          <p className="flex items-center justify-between rounded-2xl border border-slate-300/50 bg-white/70 px-3 py-2 text-xs md:text-sm dark:border-white/10 dark:bg-white/5">
            <span className="text-slate-500 dark:text-slate-300">Signer on-chain</span>
            <span className="font-mono text-slate-900 dark:text-slate-100">{shortHex(contractSigner)}</span>
          </p>
        )}
        {timestamp && (
          <p className="flex items-center justify-between rounded-2xl border border-slate-300/50 bg-white/70 px-3 py-2 text-xs md:text-sm dark:border-white/10 dark:bg-white/5">
            <span className="text-slate-500 dark:text-slate-300">Fecha almacenado</span>
            <span className="text-slate-900 dark:text-slate-100">
              {new Date(timestamp * 1000).toLocaleString()}
            </span>
          </p>
        )}
        {storedSignature && (
          <details className="rounded-2xl border border-slate-300/50 bg-white/70 px-3 py-2 text-xs text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-50">
            <summary className="cursor-pointer font-semibold">
              Ver firma almacenada
            </summary>
            <div className="mt-1 break-all font-mono">
              {storedSignature}
            </div>
          </details>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-[11px] font-medium">
        {onChainValid !== null && (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 ${
              onChainValid
                ? "bg-emerald-500/15 text-emerald-700 border border-emerald-300/50 dark:text-emerald-200"
                : "bg-rose-500/15 text-rose-700 border border-rose-300/50 dark:text-rose-200"
            }`}
          >
            On-chain: {onChainValid ? "Válido" : "Inválido"}
          </span>
        )}
        {offChainValid !== null && (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 ${
              offChainValid
                ? "bg-emerald-500/15 text-emerald-700 border border-emerald-300/50 dark:text-emerald-200"
                : "bg-rose-500/15 text-rose-700 border border-rose-300/50 dark:text-rose-200"
            }`}
          >
            Off-chain: {offChainValid ? "Válido" : "Inválido"}
          </span>
        )}
      </div>

      {(recoveredAddress || onChainValid !== null || offChainValid !== null) && (
        <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-3 text-xs text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
          <p className="font-semibold text-slate-800 dark:text-slate-100">¿Qué significan?</p>
          <ul className="mt-1 space-y-1 list-disc pl-4">
            <li>
              <span className="font-semibold">On-chain válido:</span> el contrato confirma que el hash, la firma
              almacenada y el firmante guardado coinciden con la dirección que ingresaste.
            </li>
            <li>
              <span className="font-semibold">Off-chain válido:</span> al recuperar la dirección desde la firma en el
              frontend, coincide con la dirección que ingresaste.
            </li>
            {recoveredAddress && (
              <li>
                <span className="font-semibold">Dirección recuperada:</span>{" "}
                <span className="font-mono">{recoveredAddress}</span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
