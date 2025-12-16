## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```
Formato opcional:
forge fmt
Compilar y probar:
forge build
forge test
Desplegar (ejemplo Anvil):
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast --private-key <PRIVATE_KEY>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
