import Layout from "./components/Layout";
import DocumentSigner from "./components/DocumentSigner";
import DocumentVerifier from "./components/DocumentVerifier";
import DocumentHistory from "./components/DocumentHistory";
import { useWallet } from "./hooks/useWallet";

export default function App() {
  const { isConnected, isCorrectNetwork } = useWallet();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="surface-card">
          <h2 className="text-lg font-semibold">Bienvenido a document-signer</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Conecta tu wallet en Anvil (chainId 31337) para calcular hashes, firmar y almacenar
            documentos en la blockchain local.
          </p>
          {!isConnected && (
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
              Conecta tu wallet para empezar.
            </p>
          )}
          {isConnected && !isCorrectNetwork && (
            <p className="mt-3 text-sm font-semibold text-rose-500 dark:text-rose-300">
              Red incorrecta. Usa Anvil (chainId 31337).
            </p>
          )}
        </div>

        {isConnected && isCorrectNetwork && (
          <div className="space-y-6">
            <section className="space-y-3 surface-card">
              <header className="flex items-center justify-between gap-2">
                <h3 className="text-base md:text-lg font-semibold tracking-tight">
                  Firmar documento
                </h3>
                <span className="text-[11px] uppercase tracking-wide text-slate-400">Paso 1</span>
              </header>
              <DocumentSigner />
            </section>

            <section className="space-y-3 surface-card">
              <header className="flex items-center justify-between gap-2">
                <h3 className="text-base md:text-lg font-semibold tracking-tight">
                  Verificar documento
                </h3>
                <span className="text-[11px] uppercase tracking-wide text-slate-400">Paso 2</span>
              </header>
              <DocumentVerifier />
            </section>

            <section className="space-y-3 surface-card">
              <header className="flex items-center justify-between gap-2">
                <h3 className="text-base md:text-lg font-semibold tracking-tight">
                  Historial
                </h3>
                <span className="text-[11px] uppercase tracking-wide text-slate-400">Registros</span>
              </header>
              <DocumentHistory />
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}
