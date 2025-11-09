export interface TokenInfo {
  address: string; // "0x..." or "native" for native token
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  isNative?: boolean;
  chainId?: number; // Chain ID where token exists
}