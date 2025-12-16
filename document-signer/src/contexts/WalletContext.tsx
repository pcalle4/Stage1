import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getBrowserProvider } from "../utils/ethers";

type WalletContextValue = {
  address: string | null;
  accounts: string[];
  selectedAccount: string | null;
  isConnected: boolean;
  chainId: string | null;
  isCorrectNetwork: boolean;
  connectWallet: () => Promise<void>;
  selectAccount: (account: string) => void;
  disconnectWallet: () => void;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const TARGET_CHAIN_ID = import.meta.env.VITE_CHAIN_ID || "31337";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  const isConnected = useMemo(() => !!address, [address]);
  const isCorrectNetwork = useMemo(
    () => !!chainId && chainId === TARGET_CHAIN_ID,
    [chainId],
  );

  const syncNetwork = useCallback(async () => {
    const provider = getBrowserProvider();
    const network = await provider.getNetwork();
    setChainId(network.chainId.toString());
  }, []);

  const connectWallet = useCallback(async () => {
    const provider = getBrowserProvider();
    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    setAddress(signerAddress);
    const accs = await provider.send("eth_accounts", []);
    setAccounts(accs);
    setSelectedAccount(accs[0] ?? signerAddress);

    await syncNetwork();
  }, [syncNetwork]);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setAccounts([]);
    setSelectedAccount(null);
    setChainId(null);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

      const handleAccountsChanged = (accounts: string[]) => {
        if (!accounts.length) {
          disconnectWallet();
          return;
        }
        setAddress(accounts[0]);
        setAccounts(accounts);
        setSelectedAccount(accounts[0]);
      };

    const handleChainChanged = (nextChainId: string) => {
      // MetaMask provides chainId as hex string
      const parsed = parseInt(nextChainId, 16).toString();
      setChainId(parsed);
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [disconnectWallet]);

  useEffect(() => {
    // Intento de autoconectar si ya hay permisos dados
    const tryEagerConnect = async () => {
      try {
        const provider = getBrowserProvider();
        const accounts = await provider.send("eth_accounts", []);
        if (accounts && accounts.length) {
          setAddress(accounts[0]);
          setAccounts(accounts);
          setSelectedAccount(accounts[0]);
          await syncNetwork();
        }
      } catch {
        // ignoramos errores de disponibilidad de provider
      }
    };
    tryEagerConnect();
  }, [syncNetwork]);

  const value = useMemo(
    () => ({
      address,
      isConnected,
      accounts,
      selectedAccount,
      chainId,
      isCorrectNetwork,
      connectWallet,
      selectAccount: setSelectedAccount,
      disconnectWallet,
    }),
    [address, accounts, selectedAccount, isConnected, chainId, isCorrectNetwork],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export const useWalletContext = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWalletContext debe usarse dentro de WalletProvider");
  return ctx;
};
