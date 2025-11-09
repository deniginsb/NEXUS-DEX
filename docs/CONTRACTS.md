# Smart Contracts Documentation

## Overview

Nexus DEX uses a mint/burn mechanism for all stablecoin tokens. Each token is backed 1:1 by NEX at fixed exchange rates.

## Core Contracts

### 1. StablecoinSwap
**Address:** `0x51253E3Cf94CBcABA852EbC2C2c420e687FEeC99`

Main swap router for all stablecoin tokens (BTC, ETH, SOL, etc).

### 2. StablecoinToken
Base ERC20 contract for all stablecoins with fixed `priceInNEX`.

## Deployed Tokens (22 total)

| Symbol | Address | Price (NEX) | Explorer |
|--------|---------|-------------|----------|
| BTC | `0xF0C06eaCAe941D54eDf6991738dA9F443725AA20` | 60,000 | [View](https://nexus.testnet.blockscout.com/token/0xF0C06eaCAe941D54eDf6991738dA9F443725AA20) |
| ETH | `0x0c083fD1436B7e0635f13516cd184B715DA440a2` | 3,400 | [View](https://nexus.testnet.blockscout.com/token/0x0c083fD1436B7e0635f13516cd184B715DA440a2) |
| SOL | `0xBA5eC0De01ca8e266A376297Ad8aeEe187FB7a99` | 150 | [View](https://nexus.testnet.blockscout.com/token/0xBA5eC0De01ca8e266A376297Ad8aeEe187FB7a99) |
| BNB | `0x1BD364d4C1d368944211a16ac2332eFC033eacB8` | 600 | [View](https://nexus.testnet.blockscout.com/token/0x1BD364d4C1d368944211a16ac2332eFC033eacB8) |
| USDT | `0x812aA201F4a6fD5e2eA708b1A3fa773b8AA4af9F` | 1 | [View](https://nexus.testnet.blockscout.com/token/0x812aA201F4a6fD5e2eA708b1A3fa773b8AA4af9F) |
| USDC | `0xA737dC128f03c03eb8D8e678996DC1Ef6E32E16b` | 1 | [View](https://nexus.testnet.blockscout.com/token/0xA737dC128f03c03eb8D8e678996DC1Ef6E32E16b) |
| ...and 16 more | | | |

[View complete list →](./CONTRACTS.md)

## How It Works

1. **Mint**: Send NEX → Receive stablecoin tokens
2. **Burn**: Burn stablecoin → Receive NEX back
3. **Fixed Rates**: No slippage, no oracles

---
Last updated: 2025-01-09
