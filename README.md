# document-signer (Foundry + React)

Guía rápida para levantar todo el proyecto: contratos en Foundry (carpeta `sc`) y frontend en React/Vite/TypeScript (carpeta `document-signer`).

## Requisitos
- Node.js 20.19+ (o 22.12+) para Vite 7.
- Foundry instalado (`forge`, `anvil`, `cast`).
- MetaMask configurado.

## 1. Backend (Foundry) – carpeta `sc`
```bash
cd sc

# Instalar dependencias (OpenZeppelin)
forge install OpenZeppelin/openzeppelin-contracts

# Compilar y probar
forge build
forge test

# Levantar nodo local
anvil

# Desplegar (ejemplo con clave de Anvil)
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key <PRIVATE_KEY>
```
Guarda la dirección desplegada; se usa en el frontend.

## 2. Frontend (React + Vite + TS) – carpeta `document-signer`
```bash
cd ../document-signer

# Instalar dependencias (Node 20+)
npm install

# Configurar .env con la dirección del contrato y Anvil
cat > .env <<'EOF'
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_RPC_URL=http://localhost:8545
VITE_CHAIN_ID=31337
EOF

# Levantar el dev server
npm run dev
```
Asegúrate de que MetaMask esté en la red Anvil (chainId 31337) y con el contrato en la dirección de `.env`.

## 3. Flujo en la dApp
1) Conectar la wallet (MetaMask) en Anvil.  
2) Firmar documento: subir archivo → calcular hash (keccak256) → firmar con `signMessage` → guardar en `storeDocumentHash`.  
3) Verificar documento: subir el mismo archivo → ingresar dirección firmante → validar on-chain (`verifyDocument`) y off-chain (`verifyMessage`).  
4) Historial: ver eventos `DocumentStored` registrados en Anvil.

## 4. Scripts útiles
- Backend (desde `sc`): `forge build`, `forge test`, `forge fmt`, `forge script ...`
- Frontend (desde `document-signer`): `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`
