import { BrowserProvider, Contract } from "ethers";
import DocumentRegistryAbi from "../abi/DocumentRegistry.json";

export function getBrowserProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask no está disponible en este navegador");
  }
  return new BrowserProvider(window.ethereum);
}

export async function getDocumentRegistryContract() {
  const provider = getBrowserProvider();
  const signer = await provider.getSigner();

  const address = import.meta.env.VITE_CONTRACT_ADDRESS;
  if (!address) throw new Error("Falta VITE_CONTRACT_ADDRESS en .env");

  return new Contract(address, DocumentRegistryAbi, signer);
}
