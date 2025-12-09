/**
 * Token Definitions for Nexus Testnet
 *
 * Pre-configured tokens available on the DEX.
 * Includes native token, wrapped native, and stablecoins.
 */

export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
}

export const NATIVE_TOKEN: TokenInfo = {
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  symbol: 'NEX',
  name: 'Nexus',
  decimals: 18,
}

export const WNEX: TokenInfo = {
  address: '0x11cbb81b69f6a7024ace3c83a14eb87e8c540879',
  symbol: 'WNEX',
  name: 'Wrapped NEX',
  decimals: 18,
}

export const USDC: TokenInfo = {
  address: '0x8586bac6d1d34df58bad5a7aceb95cc7a9e02552',
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
}

export const DEFAULT_TOKENS: TokenInfo[] = [NATIVE_TOKEN, WNEX, USDC]

export function getTokenBySymbol(symbol: string): TokenInfo | undefined {
  return DEFAULT_TOKENS.find(
    (token) => token.symbol.toLowerCase() === symbol.toLowerCase()
  )
}

export function getTokenByAddress(address: string): TokenInfo | undefined {
  return DEFAULT_TOKENS.find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  )
}

export function isWrappedNative(address: string): boolean {
  return address.toLowerCase() === WNEX.address.toLowerCase()
}

export function isNativeToken(address: string): boolean {
  return (
    address.toLowerCase() === NATIVE_TOKEN.address.toLowerCase() ||
    address === '0x0000000000000000000000000000000000000000'
  )
}
