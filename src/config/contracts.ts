/**
 * Nexus Testnet Contract Addresses
 *
 * All Uniswap V3 contracts deployed on Nexus Testnet (Chain ID: 3945).
 * These addresses are used for swaps, liquidity management, and price quotes.
 */

export const NEXUS_CONTRACTS = {
  // Core Uniswap V3 Contracts
  SWAP_ROUTER: '0xf96e9bf8fddf64534f9ed45a0696d02f490d0197',
  QUOTER_V2: '0x6878b5c4564f61f2d1b4d336853a211f0e0cfa11',
  NONFUNGIBLE_POSITION_MANAGER: '0x643770e279d5d0733f21d6dc03a8efbabeb3e21e',
  FACTORY: '0xfc5581ffa1fd6ab80c98701f4b3a2e91fbc4e4dc',

  // Token Addresses
  WNEX: '0x11cbb81b69f6a7024ace3c83a14eb87e8c540879',
  USDC: '0x8586bac6d1d34df58bad5a7aceb95cc7a9e02552',
}

export const QUOTER_V2_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'fee', type: 'uint24' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'quoteExactInputSingle',
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'sqrtPriceX96After', type: 'uint160' },
      { name: 'initializedTicksCrossed', type: 'uint32' },
      { name: 'gasEstimate', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

// Fee tiers available for pools
export const FEE_TIERS = {
  LOWEST: 100, // 0.01%
  LOW: 500, // 0.05%
  MEDIUM: 3000, // 0.3%
  HIGH: 10000, // 1%
}
