# Nexus DEX 🚀

A modern decentralized exchange (DEX) built on Nexus Layer 1 blockchain. Trade 26+ crypto assets with fixed exchange rates backed by NEX tokens.

![Nexus DEX](https://img.shields.io/badge/Nexus-DEX-8b5cf6?style=for-the-badge)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 🌟 Features

- **26 Supported Tokens** - Trade NEX, WNEX, and 24 popular cryptocurrencies (BTC, ETH, SOL, BNB, and more)
- **Stablecoin System** - All tokens backed by NEX with fixed exchange rates
- **Zero Slippage** - Fixed rates based on real-world USD prices
- **Instant Swaps** - Mint/burn mechanism provides instant liquidity
- **Low Fees** - Pay only gas fees, no platform fees
- **Open Source** - Fully auditable smart contracts

## 🎯 Live Demo

**Live App:** [https://nexus-dex.web.id/](https://nexus-dex.web.id/)  
**Testnet Explorer:** [https://nexus.testnet.blockscout.com](https://nexus.testnet.blockscout.com/)

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/nexus-dex.git
cd nexus-dex

# Install dependencies
yarn install

# Start local blockchain (terminal 1)
yarn chain

# Deploy contracts (terminal 2)
yarn deploy

# Start frontend (terminal 3)
yarn start
```

Visit `http://localhost:3000` and start swapping! 

[📖 Detailed Quick Start Guide →](./QUICKSTART.md)

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Frontend  │────────▶│  Smart Contracts │────────▶│  Nexus L1   │
│  (Next.js)  │         │  (Solidity 0.8)  │         │  Blockchain │
└─────────────┘         └──────────────────┘         └─────────────┘
      │                          │
      │                          ├── StablecoinSwap
      │                          ├── StablecoinToken (x22)
      │                          ├── NativeNEXSwapV2
      │                          └── WNEX, NEXA, NEXB
      │
      └── RainbowKit + Wagmi + Viem
```

## 💱 Supported Tokens

| Token | Symbol | Exchange Rate | Type |
|-------|--------|---------------|------|
| Nexus Token | NEX | Base ($1) | Native |
| Wrapped NEX | WNEX | 1 NEX | Wrapped |
| Bitcoin | BTC | 60,000 NEX | Stablecoin |
| Ethereum | ETH | 3,400 NEX | Stablecoin |
| Solana | SOL | 150 NEX | Stablecoin |
| Binance Coin | BNB | 600 NEX | Stablecoin |
| Aave | AAVE | 100 NEX | Stablecoin |
| Litecoin | LTC | 80 NEX | Stablecoin |
| Avalanche | AVAX | 40 NEX | Stablecoin |
| Chainlink | LINK | 15 NEX | Stablecoin |
| Cosmos | ATOM | 10 NEX | Stablecoin |
| Uniswap | UNI | 8 NEX | Stablecoin |
| Polkadot | DOT | 7 NEX | Stablecoin |
| NEAR | NEAR | 4 NEX | Stablecoin |
| Tether | USDT | 1 NEX | Stablecoin |
| USD Coin | USDC | 1 NEX | Stablecoin |
| ... and 10 more | | | |

[📝 View all 26 tokens and contract addresses →](./docs/CONTRACTS.md)

## 🔧 Technology Stack

### Smart Contracts
- **Solidity 0.8.20** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Secure contract libraries
- **Ethers.js v6** - Ethereum interactions

### Frontend
- **Next.js 15** - React framework (App Router)
- **TypeScript** - Type safety
- **Tailwind CSS + DaisyUI** - Styling
- **RainbowKit** - Wallet connection
- **Wagmi + Viem** - Web3 interactions

### Blockchain
- **Nexus L1 Testnet3**
- **Chain ID:** 3945
- **RPC:** https://testnet.rpc.nexus.xyz
- **Explorer:** https://nexus.testnet.blockscout.com/

## 📝 Smart Contracts

### Main Contracts (Nexus Testnet3)

| Contract | Address | Purpose |
|----------|---------|---------|
| StablecoinSwap | `0x51253E3Cf94CBcABA852EbC2C2c420e687FEeC99` | Main swap router |
| NativeNEXSwapV2 | `0x48A3399B5D0630A746075167a944736d9112C458` | NEX/WNEX swaps |
| WNEX | `0x5A6128e1cF97339cD9C057a940950c02DbeA0B7B` | Wrapped NEX token |

[🔍 View all deployed contracts →](./docs/CONTRACTS.md)

## 🔐 How It Works

### Mint/Burn Mechanism

Each stablecoin is backed 1:1 by NEX tokens using a mint/burn system:

**Buying tokens (Minting):**
```
Send 150 NEX → Receive 1 SOL token
Send 60,000 NEX → Receive 1 BTC token
```

**Selling tokens (Burning):**
```
Burn 1 SOL token → Receive 150 NEX
Burn 1 BTC token → Receive 60,000 NEX
```

**Benefits:**
- ✅ Zero slippage
- ✅ Infinite liquidity (as long as contract has NEX)
- ✅ No impermanent loss
- ✅ Fixed, predictable rates

### Security Features

- ✅ **OpenZeppelin standards** - Battle-tested ERC20 implementation
- ✅ **Owner-controlled minting** - Only StablecoinSwap can mint tokens
- ✅ **Fixed exchange rates** - No oracle manipulation risk
- ✅ **No proxy pattern** - Immutable contract logic
- ✅ **Event logging** - Full transaction transparency

## 📚 Documentation

- [📖 Quick Start Guide](./QUICKSTART.md) - Get started in 5 minutes
- [🏗️ Architecture Overview](./docs/ARCHITECTURE.md) - System design and data flow
- [📝 Smart Contract Docs](./docs/CONTRACTS.md) - All deployed contracts and addresses
- [🚀 Deployment Guide](./docs/DEPLOYMENT.md) - Deploy your own instance
- [🤝 Contributing Guide](./CONTRIBUTING.md) - How to contribute

## 🧪 Testing

```bash
# Run smart contract tests
yarn hardhat:test

# Check TypeScript types
yarn next:check-types

# Lint code
yarn lint
```

## 🚢 Deployment

### Deploy Smart Contracts

```bash
# Deploy to Nexus Testnet
yarn deploy --network nexus

# Verify contracts on Blockscout
yarn hardhat:verify --network nexus
```

### Deploy Frontend to Vercel

```bash
# Build and deploy
cd packages/nextjs
yarn vercel --prod
```

[📖 Full deployment guide →](./docs/DEPLOYMENT.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with amazing open-source tools:

- [Scaffold-ETH 2](https://scaffoldeth.io/) - Ethereum development stack
- [Nexus L1 Blockchain](https://nexus.xyz/) - Fast and scalable L1
- [OpenZeppelin](https://www.openzeppelin.com/) - Secure smart contract libraries
- [RainbowKit](https://www.rainbowkit.com/) - Beautiful wallet connection
- [Wagmi](https://wagmi.sh/) - React hooks for Ethereum
- [Viem](https://viem.sh/) - TypeScript Ethereum library

## ⚠️ Disclaimer

**This DEX is deployed on Nexus Testnet3 for demonstration purposes.**

- ⚠️ Do not use real funds
- ⚠️ Use at your own risk
- ⚠️ Always DYOR (Do Your Own Research)

For production use, please get a professional security audit.

## 📞 Links

- **Live App:** https://nexus-dex.web.id/
- **Explorer:** https://nexus.testnet.blockscout.com/
- **Documentation:** [./docs](./docs)
- **Issues:** [GitHub Issues](https://github.com/deniginsb/NEXUS-DEX/issues)

---

<div align="center">
  <p><strong>Built with ❤️ for the Nexus ecosystem</strong></p>
  <p>
    <a href="https://nexus-dex.web.id/">Website</a> •
    <a href="./docs">Documentation</a> •
    <a href="https://nexus.testnet.blockscout.com/">Explorer</a>
  </p>
</div>
