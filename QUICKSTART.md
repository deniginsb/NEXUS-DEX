# Quick Start Guide 🚀

Get Nexus DEX running locally in 5 minutes!

## Prerequisites

- Node.js v20+ installed
- Yarn v3+ installed
- MetaMask wallet extension

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nexus-dex.git
cd nexus-dex

# Install dependencies (takes 2-3 minutes)
yarn install
```

## Run Locally

Open 3 terminal windows:

### Terminal 1: Start Local Blockchain

```bash
yarn chain
```

This starts a local Hardhat node at `http://localhost:8545`

### Terminal 2: Deploy Smart Contracts

```bash
# Wait for chain to be ready, then:
yarn deploy
```

This deploys:
- WNEX, NEXA, NEXB tokens
- NativeNEXSwapV2 contract
- 22 stablecoin tokens (BTC, ETH, SOL, etc)
- StablecoinSwap contract

### Terminal 3: Start Frontend

```bash
yarn start
```

Frontend runs at `http://localhost:3000`

## First Swap

1. Open `http://localhost:3000/swap`
2. Connect your MetaMask wallet
3. Switch to localhost network (Chain ID: 31337)
4. You should have test NEX tokens already
5. Select NEX → SOL
6. Enter amount (e.g., 150 NEX)
7. Click "Swap Tokens"
8. Confirm in MetaMask
9. Done! You now have 1 SOL token

## Connect to Nexus Testnet

To use the live testnet instead:

1. Add Nexus Testnet3 to MetaMask:
   - Network Name: Nexus Testnet3
   - RPC URL: https://testnet.rpc.nexus.xyz
   - Chain ID: 3945
   - Symbol: NEX
   - Explorer: https://nexus.testnet.blockscout.com/

2. Get testnet NEX from faucet (if available)

3. Update `scaffold.config.ts`:
   ```typescript
   targetNetworks: [chains.nexusTestnet],
   ```

4. Restart frontend:
   ```bash
   yarn start
   ```

5. Swap on live testnet!

## Troubleshooting

### "Cannot connect to localhost:8545"
- Make sure `yarn chain` is running in Terminal 1
- Check if port 8545 is available

### "Contract not deployed"
- Run `yarn deploy` after chain is running
- Check Terminal 2 for deployment errors

### "Insufficient funds"
- Local node gives you 10,000 test ETH/NEX automatically
- Make sure you're connected to the right network

### "Transaction failed"
- Check if you have enough tokens
- Verify you're on the correct network
- Try refreshing the page

## Next Steps

- [Read full documentation](./docs)
- [Understand the architecture](./docs/ARCHITECTURE.md)
- [Learn about smart contracts](./docs/CONTRACTS.md)
- [Deploy to production](./docs/DEPLOYMENT.md)

## Need Help?

- Check [Documentation](./docs)
- Open an [Issue](https://github.com/yourusername/nexus-dex/issues)
- Read [Contributing Guide](./CONTRIBUTING.md)

Happy swapping! 🎉
