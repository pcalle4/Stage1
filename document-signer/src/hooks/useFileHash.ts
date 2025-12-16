import { useCallback, useState } from "react";
import { keccak256 } from "ethers";

export function useFileHash() {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetFile = useCallback((nextFile: File | null) => {
    setFile(nextFile);
    setHash(null);
    setError(null);
  }, []);

  const computeHash = useCallback(async () => {
    if (!file) {
      setError("No hay archivo seleccionado");
      return;
    }

    setIsHashing(true);
    setError(null);
    setHash(null);

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const digest = keccak256(bytes);
      setHash(digest);
    } catch (err) {
      console.error("Error al calcular hash:", err);
      setError("No se pudo calcular el hash del archivo");
    } finally {
      setIsHashing(false);
    }
  }, [file]);

  return {
    file,
    hash,
    isHashing,
    error,
    setFile: handleSetFile,
    computeHash,
  };
}
