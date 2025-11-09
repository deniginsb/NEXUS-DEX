# Deployment Guide

## Prerequisites

Before deploying, ensure you have:

- Node.js >= 20.18.3
- Yarn v3.2.3+
- Private key with sufficient NEX for gas fees
- Access to Nexus Testnet3 RPC

## Environment Setup

### 1. Hardhat Environment

Create `packages/hardhat/.env`:

```bash
DEPLOYER_PRIVATE_KEY=your_private_key_here
NEXUS_RPC_URL=https://testnet.rpc.nexus.xyz
NEXUS_CHAIN_ID=3945
```

### 2. Next.js Environment

Create `packages/nextjs/.env.local`:

```bash
NEXT_PUBLIC_CHAIN_ID=3945
NEXT_PUBLIC_RPC_URL=https://testnet.rpc.nexus.xyz
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

## Deploy Smart Contracts

### Deploy All Contracts

```bash
cd packages/hardhat
yarn deploy --network nexus
```

This will deploy in order:
1. WNEX Token
2. NEXA Token
3. NEXB Token
4. NativeNEXSwapV2
5. 22 Stablecoin Tokens (BTC, ETH, SOL, etc)
6. StablecoinSwap (with auto-registration)

### Deploy Individual Contracts

```bash
# Deploy only stablecoins
yarn deploy --network nexus --tags Stablecoins

# Deploy only swap contract
yarn deploy --network nexus --tags StablecoinSwap
```

### Verify Contracts on Blockscout

```bash
# Verify a single contract
npx hardhat verify --network nexus CONTRACT_ADDRESS "Constructor" "Args"

# Example: Verify BTC stablecoin
npx hardhat verify --network nexus 0xF0C06eaCAe941D54eDf6991738dA9F443725AA20 \
  "BITCOIN" "BTC" "60000000000000000000000" "0xYourDeployerAddress"
```

## Update Frontend with Addresses

After deployment, update `packages/nextjs/utils/tokenRegistry.ts`:

```typescript
private static autoAddDeployedTokens() {
  const deployedTokens: TokenInfo[] = [
    {
      address: "0xYourNewAddress",
      symbol: "BTC",
      name: "Bitcoin",
      decimals: 18,
      chainId: 3945,
    },
    // ... more tokens
  ];
}
```

## Deploy Frontend to Vercel

### Option 1: CLI Deployment

```bash
cd packages/nextjs
yarn vercel --prod
```

### Option 2: GitHub Integration

1. Push to GitHub:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

2. Connect to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Select `packages/nextjs` as root directory
   - Deploy

### Vercel Environment Variables

Set these in Vercel dashboard:

- `NEXT_PUBLIC_CHAIN_ID=3945`
- `NEXT_PUBLIC_RPC_URL=https://testnet.rpc.nexus.xyz`
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id`

## Post-Deployment Checklist

- [ ] Verify all contracts on Blockscout
- [ ] Test NEX → Stablecoin swaps
- [ ] Test Stablecoin → NEX swaps
- [ ] Test WNEX wrapping/unwrapping
- [ ] Verify exchange rates display correctly
- [ ] Check wallet connection works
- [ ] Test on mobile devices
- [ ] Monitor gas costs

## Troubleshooting

### Deployment Fails with "Insufficient Funds"

Ensure deployer wallet has enough NEX:
```bash
# Check balance on Nexus Testnet3
curl -X POST https://testnet.rpc.nexus.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["YOUR_ADDRESS","latest"],"id":1}'
```

### Contract Already Deployed

Hardhat may skip redeployment. To force redeploy:
```bash
rm -rf deployments/nexus
yarn deploy --network nexus --reset
```

### Vercel Build Fails

Check build logs and ensure:
- All dependencies installed
- TypeScript compiles without errors
- Environment variables set correctly

Run local build test:
```bash
yarn build
```

### Frontend Can't Connect to Contracts

1. Check contract addresses in `tokenRegistry.ts`
2. Verify RPC URL is correct
3. Check wallet is on correct network (Chain ID 3945)

## Monitoring & Maintenance

### Check Contract Balances

```bash
# Check StablecoinSwap NEX balance
npx hardhat run scripts/checkBalance.ts --network nexus
```

### Fund StablecoinSwap

If liquidity runs low:
```bash
# Send NEX to StablecoinSwap
npx hardhat run scripts/fundSwap.ts --network nexus
```

### Update Token Prices

To change exchange rates, redeploy stablecoin tokens with new prices:
```bash
# Edit deploy/08_deploy_stablecoins.ts
# Update priceNEX values
yarn deploy --network nexus --tags Stablecoins --reset
```

## Security Best Practices

- 🔒 Never commit `.env` files
- 🔒 Use hardware wallet for mainnet deployment
- 🔒 Test thoroughly on testnet before mainnet
- 🔒 Get professional audit before mainnet launch
- 🔒 Use multisig for contract ownership
- 🔒 Monitor contracts for unusual activity

---

Last updated: 2025-11-10

