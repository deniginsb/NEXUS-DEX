# Smart Contract Addresses

All contracts are deployed on **Nexus Testnet** (Chain ID: 3945)

## Core Uniswap V3 Contracts

| Contract | Address | Description |
|----------|---------|-------------|
| UniswapV3Factory | `0xfc5581ffa1fd6ab80c98701f4b3a2e91fbc4e4dc` | Creates and manages liquidity pools |
| SwapRouter | `0xf96e9bf8fddf64534f9ed45a0696d02f490d0197` | Handles token swap transactions |
| QuoterV2 | `0x6878b5c4564f61f2d1b4d336853a211f0e0cfa11` | Provides price quotes without executing swaps |
| NonfungiblePositionManager | `0x643770e279d5d0733f21d6dc03a8efbabeb3e21e` | Manages liquidity positions as NFTs |
| TickLens | `0xd13dfb9d3b7b0b3ed6ec1e9d7b684d17d96c6598` | Helper contract for reading tick data |

## Token Contracts

| Token | Address | Decimals |
|-------|---------|----------|
| WNEX (Wrapped NEX) | `0x11cbb81b69f6a7024ace3c83a14eb87e8c540879` | 18 |
| USDC | `0x8586bac6d1d34df58bad5a7aceb95cc7a9e02552` | 6 |

## Active Liquidity Pools

| Pool | Fee Tier | Address |
|------|----------|---------|
| WNEX/USDC | 0.3% (3000) | `0x841cca0c6e074d63cba7a4c8e63dc6e9e5d05352` |

## Network Configuration

```json
{
  "chainId": 3945,
  "chainName": "Nexus Testnet",
  "rpcUrl": "https://rpc.nexus.testnet.rollup.cc",
  "explorer": "https://explorer.nexus.testnet.rollup.cc",
  "nativeCurrency": {
    "name": "NEX",
    "symbol": "NEX",
    "decimals": 18
  }
}
```

## Verifying Contracts

You can verify contract addresses and interact with them using the Nexus Explorer:

- Factory: [View on Explorer](https://explorer.nexus.testnet.rollup.cc/address/0xfc5581ffa1fd6ab80c98701f4b3a2e91fbc4e4dc)
- SwapRouter: [View on Explorer](https://explorer.nexus.testnet.rollup.cc/address/0xf96e9bf8fddf64534f9ed45a0696d02f490d0197)
- QuoterV2: [View on Explorer](https://explorer.nexus.testnet.rollup.cc/address/0x6878b5c4564f61f2d1b4d336853a211f0e0cfa11)

## Getting Testnet Tokens

To test the DEX, you need testnet NEX tokens. You can get them from:
1. Nexus Testnet Faucet (if available)
2. Community channels
3. Direct transfer from other testnet users
