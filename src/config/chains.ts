/**
 * Nexus Testnet Chain Configuration
 *
 * This file contains the network configuration for Nexus Testnet.
 * Used throughout the application for RPC calls, transaction signing,
 * and block explorer links.
 */

export const NEXUS_TESTNET = {
  id: 3945,
  name: 'Nexus Testnet',
  nativeCurrency: {
    name: 'NEX',
    symbol: 'NEX',
    decimals: 18,
  },
  rpcUrls: {
    default: 'https://rpc.nexus.testnet.rollup.cc',
    public: 'https://rpc.nexus.testnet.rollup.cc',
  },
  blockExplorers: {
    default: {
      name: 'Nexus Explorer',
      url: 'https://explorer.nexus.testnet.rollup.cc',
    },
  },
  testnet: true,
}

export const SUPPORTED_CHAINS = [NEXUS_TESTNET]

export function getChainById(chainId: number) {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId)
}

export function isNexusTestnet(chainId?: number): boolean {
  return chainId === 3945
}
