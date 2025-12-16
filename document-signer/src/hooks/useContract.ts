import { useEffect, useState } from "react";
import { Contract } from "ethers";
import { useWallet } from "./useWallet";
import { getDocumentRegistryContract } from "../utils/ethers";

export function useDocumentRegistry() {
  const { isConnected } = useWallet();
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (!isConnected) {
      setContract(null);
      return;
    }

    (async () => {
      try {
        const instance = await getDocumentRegistryContract();
        setContract(instance);
      } catch (error) {
        console.error("Error creando contrato:", error);
        setContract(null);
      }
    })();
  }, [isConnected]);

  return contract;
}
