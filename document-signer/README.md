# document-signer dApp (frontend)

Frontend React + Vite + TypeScript para interactuar con el contrato `DocumentRegistry` en la red local de Anvil (chainId 31337).

## Requisitos previos
- Node.js 20.19+ (o 22.12+). Vite 7 no funciona con Node 16.
- MetaMask configurado y conectado a la red local Anvil.
- Contrato `DocumentRegistry` desplegado en Anvil (usa el script de Foundry o tu flujo preferido).

## Configuración rápida

1) Instalar dependencias:
```bash
npm install
```

2) Variables de entorno (`.env` en la raíz del proyecto):
```bash
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_RPC_URL=http://localhost:8545
VITE_CHAIN_ID=31337
```

3) Levantar Anvil (si no lo tienes corriendo):
```bash
anvil
```

4) Levantar en modo desarrollo:
```bash
npm run dev
```

MetaMask debe estar conectada a Anvil (chainId 31337) y con el contrato desplegado en la dirección indicada.

## Flujo actual en la dApp
- Conectar wallet (MetaMask) a Anvil.
- Subir archivo, calcular hash (keccak256 en frontend).
- Firmar hash con `signMessage`.
- Llamar a `storeDocumentHash` del contrato (timestamp actual, firma y hash).
- Verificar documento: subir el archivo, ingresar dirección firmante, validar on-chain (`verifyDocument`) y off-chain (`verifyMessage`).
- Historial: listar eventos `DocumentStored` desde la red local.

## Scripts
- `npm run dev` — entorno de desarrollo.
- `npm run build` — build de producción.
- `npm run preview` — previsualización del build.
- `npm run lint` — linting (puede requerir Node moderno por `structuredClone` en ESLint).
