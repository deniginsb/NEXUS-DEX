# Architecture Overview

## System Design

Nexus DEX uses a **mint/burn stablecoin model** rather than traditional liquidity pools. This design provides:

- ✅ Zero slippage
- ✅ Infinite liquidity (as long as contract has NEX)
- ✅ Fixed exchange rates
- ✅ No impermanent loss
- ✅ Simple smart contracts

## Components

### 1. Smart Contracts Layer

```
┌─────────────────────────────────────────────────────┐
│                 Smart Contracts                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐         ┌──────────────┐        │
│  │ StablecoinSwap│────────▶│ StablecoinToken│      │
│  │              │  mint   │  (BTC, ETH,..)│       │
│  │  - swapNEX   │  burn   │                │       │
│  │  - swapToken │         │  - priceInNEX  │       │
│  └──────────────┘         └──────────────┘        │
│         │                                           │
│         │                                           │
│  ┌──────▼──────────┐                               │
│  │ NativeNEXSwapV2 │                               │
│  │  - WNEX wraps   │                               │
│  │  - NEXA/NEXB    │                               │
│  └─────────────────┘                               │
└─────────────────────────────────────────────────────┘
```

#### StablecoinSwap Contract

**Purpose:** Main entry point for all token swaps

**Key Functions:**
- `swapNEXToToken(address token, uint256 minTokens)` - Mint tokens with NEX
- `swapTokenToNEX(address token, uint256 amount, uint256 minNEX)` - Burn tokens for NEX
- `registerStablecoin(address token)` - Owner registers new stablecoin

**State:**
- `mapping(address => bool) isStablecoinToken` - Registered tokens
- `address public immutable WNEX` - WNEX token reference

#### StablecoinToken Contract

**Purpose:** ERC20 token with mint/burn controlled by StablecoinSwap

**Key Properties:**
- `uint256 public priceInNEX` - Fixed price (e.g., 150e18 for SOL)
- `address public swapContract` - Only this address can mint/burn

**Key Functions:**
- `mintWithNEX(address to, uint256 nexAmount)` - Mint based on NEX received
- `burnForNEX(address from, uint256 tokenAmount)` - Burn and calculate NEX return

**Formula:**
```solidity
// Minting
tokensToMint = (nexAmount * 1e18) / priceInNEX

// Burning
nexToReturn = (tokenAmount * priceInNEX) / 1e18
```

### 2. Frontend Layer

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐                                  │
│  │  Token UI    │──┐                               │
│  │  (Dropdowns) │  │                               │
│  └──────────────┘  │                               │
│                    ▼                                │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ TokenRegistry│─▶│  Swap Logic  │               │
│  │ (prices,     │  │ (handleSwap) │               │
│  │  balances)   │  └──────────────┘               │
│  └──────────────┘         │                        │
│                            │                        │
│                    ┌───────▼────────┐              │
│                    │ useScaffold    │              │
│                    │ WriteContract  │              │
│                    └────────────────┘              │
└─────────────────────────────────────────────────────┘
```

#### TokenRegistry (utils/tokenRegistry.ts)

**Purpose:** Central token management and rate calculations

**Key Methods:**
```typescript
// Get token info by symbol/address
static getTokenBySymbol(symbol: string): TokenInfo | null
static getTokenByAddress(address: string): TokenInfo | null

// Calculate swap amounts
static calculateSwapRate(from: TokenInfo, to: TokenInfo, amount: string): string

// Get formatted exchange rate
static getExchangeRate(from: TokenInfo, to: TokenInfo): string

// Balance management
static async getTokenBalance(token: TokenInfo, address: string): Promise<string>
```

**Token Price Table:**
```typescript
private static readonly TOKEN_PRICES_USD = {
  NEX: 1,        // Base token
  BTC: 60000,    // 60,000 NEX per BTC
  ETH: 3400,     // 3,400 NEX per ETH
  SOL: 150,      // 150 NEX per SOL
  // ... 22 total tokens
}
```

#### Swap Flow (Frontend)

```typescript
// 1. User selects tokens and enters amount
setFromToken(NEX)
setToToken(SOL)
setFromAmount("150")

// 2. Calculate expected output
const toAmount = TokenRegistry.calculateSwapRate(NEX, SOL, "150")
// Result: "1" SOL

// 3. Display exchange rate
const rate = TokenRegistry.getExchangeRate(NEX, SOL)
// Result: "1 NEX = 0.00666667 SOL"

// 4. Execute swap
const hash = await writeContractAsync({
  address: STABLECOIN_SWAP_ADDRESS,
  abi: STABLECOIN_SWAP_ABI,
  functionName: "swapNEXToToken",
  args: [SOL.address, minTokens],
  value: parseEther("150")
})
```

### 3. Blockchain Layer

```
┌─────────────────────────────────────────────────────┐
│              Nexus Layer 1 Blockchain               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Chain ID: 3945                                     │
│  RPC: https://testnet.rpc.nexus.xyz                │
│  Block Time: ~2 seconds                             │
│  Gas Token: NEX                                     │
│  EVM Compatible: Yes (EVM v0.8.20)                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Data Flow

### NEX → Stablecoin Swap

```
User Wallet                Frontend              Blockchain
    │                          │                      │
    │  1. Select: NEX → SOL    │                      │
    │  2. Enter: 150 NEX       │                      │
    │─────────────────────────▶│                      │
    │                          │                      │
    │                          │  3. Calculate:       │
    │                          │     150 NEX / 150    │
    │                          │     = 1 SOL          │
    │                          │                      │
    │  4. Confirm transaction  │                      │
    │◀─────────────────────────│                      │
    │                          │                      │
    │  5. Sign & Send          │  6. swapNEXToToken   │
    │──────────────────────────┼─────────────────────▶│
    │                          │                      │
    │                          │  7. StablecoinSwap   │
    │                          │     calls mintWithNEX│
    │                          │                      │
    │                          │  8. SOL minted       │
    │◀─────────────────────────┼──────────────────────│
    │  9. Balance updated      │                      │
```

### Stablecoin → NEX Swap

```
User Wallet                Frontend              Blockchain
    │                          │                      │
    │  1. Select: SOL → NEX    │                      │
    │  2. Enter: 1 SOL         │                      │
    │─────────────────────────▶│                      │
    │                          │                      │
    │                          │  3. Calculate:       │
    │                          │     1 SOL * 150      │
    │                          │     = 150 NEX        │
    │                          │                      │
    │  4. Approve spending     │  5. ERC20.approve()  │
    │──────────────────────────┼─────────────────────▶│
    │                          │                      │
    │  6. Confirm swap         │  7. swapTokenToNEX   │
    │──────────────────────────┼─────────────────────▶│
    │                          │                      │
    │                          │  8. SOL burned       │
    │                          │  9. 150 NEX sent     │
    │◀─────────────────────────┼──────────────────────│
    │  10. Balance updated     │                      │
```

## Security Model

### Access Control

```
Owner (Deployer)
    │
    ├──▶ StablecoinSwap
    │       │
    │       └──▶ Can registerStablecoin()
    │       └──▶ Can fundContract()
    │
    ├──▶ StablecoinToken (each)
    │       │
    │       └──▶ Can setSwapContract()
    │       └──▶ Can setPrice()
    │
    └──▶ NativeNEXSwapV2
            │
            └──▶ Can withdraw()
```

### Trust Assumptions

1. **Fixed Rates**: Assumes hardcoded prices reflect market value
2. **Liquidity**: Assumes StablecoinSwap has sufficient NEX
3. **Immutability**: Contracts cannot be upgraded (no proxy pattern)
4. **Owner Honest**: Owner can update prices and set swap contract

### Attack Vectors

| Attack | Mitigation |
|--------|------------|
| Price manipulation | Fixed rates, no oracles |
| Unauthorized minting | Only StablecoinSwap can mint |
| Reentrancy | Checks-Effects-Interactions pattern |
| Liquidity drain | Owner must monitor and fund |

## Performance Considerations

### Gas Costs

| Operation | Estimated Gas |
|-----------|--------------|
| NEX → Token (first time) | ~80,000 |
| NEX → Token (subsequent) | ~65,000 |
| Token → NEX (approve) | ~45,000 |
| Token → NEX (swap) | ~70,000 |

### Scalability

- **Throughput**: Limited by Nexus L1 block time (~2s)
- **State Growth**: Each new token adds minimal state
- **Frontend**: Next.js static generation for fast loads

## Future Enhancements

### Phase 2
- [ ] Add liquidity pools for token-to-token swaps
- [ ] Implement dynamic pricing with oracles

### Phase 3
- [ ] Staking rewards
- [ ] Flash loan support

### Phase 4
- [ ] Cross-chain bridges
- [ ] Limit orders
- [ ] Advanced trading charts

---

Last updated: 2025-11-10

