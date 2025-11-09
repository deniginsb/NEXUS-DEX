import { TokenInfo } from "./types";
import { formatEther, formatUnits, encodeFunctionData } from "viem";

// RPC Proxy endpoint (serverless function)
const RPC_PROXY_URL = "/api/rpc";

// Legacy: Keep chain definition for reference
const NEXUS_TESTNET = {
  id: 3945,
  name: "Nexus Testnet3",
  nativeCurrency: {
    decimals: 18,
    name: "Nexus Token",
    symbol: "NEX",
  },
} as const;

export class TokenRegistry {
  private static readonly STORAGE_KEY = "nexus-dex-tokens";
  private static readonly CUSTOM_TOKENS_KEY = "nexus-dex-custom-tokens";
  private static readonly BALANCES_KEY = "nexus-dex-balances";

  // Token prices in USD (hardcoded, NEX = $1 as base)
  private static readonly TOKEN_PRICES_USD: Record<string, number> = {
    NEX: 1, // Base token, $1
    WNEX: 1, // 1:1 with NEX
    NEXA: 0.000001, // 1 NEXA = 0.000001 USD (1 NEX = 1M NEXA)
    NEXB: 0.000001, // 1 NEXB = 0.000001 USD (1 NEX = 1M NEXB)
    BTC: 60000, // Bitcoin
    ETH: 3400, // Ethereum
    SOL: 150, // Solana
    ADA: 0.5, // Cardano
    MATIC: 0.8, // Polygon
    LINK: 15, // Chainlink
    AVAX: 40, // Avalanche
    UNI: 8, // Uniswap
    DOGE: 0.1, // Dogecoin
    SHIB: 0.00001, // Shiba Inu
    LTC: 80, // Litecoin
    BNB: 600, // Binance Coin
    USDT: 1, // Tether (stablecoin)
    XRP: 0.6, // Ripple
    USDC: 1, // USD Coin (stablecoin)
    DOT: 7, // Polkadot
    ATOM: 10, // Cosmos
    ALGO: 0.2, // Algorand
    NEAR: 4, // NEAR Protocol
    FTM: 0.4, // Fantom
    AAVE: 100, // Aave
    SAND: 0.5, // The Sandbox
  };

  // Default tokens that are always available
  // Note: Only native NEX is here. NEXA, NEXB, WNEX are now in custom tokens and can be added/removed
  private static readonly DEFAULT_TOKENS: TokenInfo[] = [
    {
      address: "native",
      symbol: "NEX",
      name: "Nexus Token",
      decimals: 18,
      logoURI: "",
      isNative: true,
      chainId: 3945, // Default to Nexus Testnet3
    },
  ];

  // Get all tokens (default + custom)
  static getAllTokens(): TokenInfo[] {
    const customTokens = this.getCustomTokens();
    return [...this.DEFAULT_TOKENS, ...customTokens];
  }

  // Get only custom tokens
  static getCustomTokens(): TokenInfo[] {
    if (typeof window === "undefined") return [];

    try {
      // Auto-add predefined deployed tokens if not already added
      this.autoAddDeployedTokens();

      const stored = localStorage.getItem(this.CUSTOM_TOKENS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Auto-add predefined deployed tokens
  private static autoAddDeployedTokens(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(this.CUSTOM_TOKENS_KEY);
      const existingTokens: TokenInfo[] = stored ? JSON.parse(stored) : [];

      // Predefined deployed token addresses - ALL tokens that are actually deployed
      const deployedTokens: TokenInfo[] = [
        { address: "0x5A6128e1cF97339cD9C057a940950c02DbeA0B7B", symbol: "WNEX", name: "Wrapped NEX", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0x3a3a47b6503EFf7Ca31476312DE56e8639485a6b", symbol: "NEXA", name: "NEXA Token", decimals: 6, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0xcDC697DF5E502c7491AaFECe1b0EB8F4F935A404", symbol: "NEXB", name: "NEXB Token", decimals: 6, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0xF0C06eaCAe941D54eDf6991738dA9F443725AA20", symbol: "BTC", name: "Bitcoin", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0x0c083fD1436B7e0635f13516cd184B715DA440a2", symbol: "ETH", name: "Ethereum", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0xBA5eC0De01ca8e266A376297Ad8aeEe187FB7a99", symbol: "SOL", name: "Solana", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0xa8eE5909dd786B3f53b374036603faeCDBf19a89", symbol: "ADA", name: "Cardano", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0xadE270eD92B457B24745e06bED3a539a8fe87b7d", symbol: "MATIC", name: "Polygon", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0x918800A6147E75bc8334B96F7c1a924Bb63C4a18", symbol: "LINK", name: "Chainlink", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0x301081Be106c050B0d754D00C77D7d2527b3Ad69", symbol: "AVAX", name: "Avalanche", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0xd79159934FB7DB373F62597eDA45603C128702D4", symbol: "UNI", name: "Uniswap", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0x3802cDB663e4A98C59db7c5a9c3d1B55b71F66d3", symbol: "DOGE", name: "Dogecoin", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0xD6C067B80d8553052Dc1945A89FD1EE75637838b", symbol: "SHIB", name: "Shiba Inu", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0x7ac62c2F778B2CC736e8A477F7833D62c651A01f", symbol: "LTC", name: "Litecoin", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0x1BD364d4C1d368944211a16ac2332eFC033eacB8", symbol: "BNB", name: "Binance Coin", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0x812aA201F4a6fD5e2eA708b1A3fa773b8AA4af9F", symbol: "USDT", name: "Tether", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0xC57B4487785dEB1f40dff81ccb4774AE937CB192", symbol: "XRP", name: "Ripple", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0x02D2D1867C125ff59e9492492cd30E91C24B3FE9", symbol: "DOT", name: "Polkadot", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0xA737dC128f03c03eb8D8e678996DC1Ef6E32E16b", symbol: "USDC", name: "USD Coin", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0x21a232bC802FB5348Eba4B66b26f83ce93768e6e", symbol: "ATOM", name: "Cosmos", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0x8c6bA7A96Aa74221a8deCdC8AB86417966b7F7c1", symbol: "ALGO", name: "Algorand", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0x9E8F5A9d78d76Ef4671a2d14CfcC607C21b5176A", symbol: "NEAR", name: "NEAR Protocol", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0xDE92F069CbbfFEa5062E96D446E9d007aFaDf00d", symbol: "FTM", name: "Fantom", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0x75e2fb8C8190f9C0f96D3BB90FC2690493151809", symbol: "AAVE", name: "Aave", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
        { address: "0x3fBC9811774B8A73FE09aB26dB384f428913461a", symbol: "SAND", name: "The Sandbox", decimals: 18, logoURI: "", isNative: false, chainId: 3945 },
      ];

      // Check if each deployed token exists in localStorage
      const addressesInStorage = new Set(existingTokens.map(t => t.address.toLowerCase()));
      const newTokens = deployedTokens.filter(t => !addressesInStorage.has(t.address.toLowerCase()));

      if (newTokens.length > 0) {
        const updatedTokens = [...existingTokens, ...newTokens];
        localStorage.setItem(this.CUSTOM_TOKENS_KEY, JSON.stringify(updatedTokens));
        console.log(`✅ Auto-added ${newTokens.length} deployed token(s):`, newTokens.map(t => t.symbol).join(", "));
      }
    } catch (error) {
      console.error("Failed to auto-add deployed tokens:", error);
    }
  }

  // Save balances to localStorage
  static saveBalances(balances: Record<string, string>): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.BALANCES_KEY, JSON.stringify(balances));
    }
  }

  // Get balances from localStorage
  static getBalances(): Record<string, string> {
    if (typeof window === "undefined") return {};
    
    try {
      const stored = localStorage.getItem(this.BALANCES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  // Add a custom token
  static async addCustomToken(address: string): Promise<TokenInfo | null> {
    if (!this.isValidAddress(address)) {
      if (typeof window !== "undefined") {
        alert("❌ Invalid token address format");
      }
      return null;
    }

    try {
      if (typeof window === "undefined") return null;
      
      const customTokens = this.getCustomTokens();
      
      // Check if token already exists
      if (customTokens.some(t => 
        t.address.toLowerCase() === address.toLowerCase()
      )) {
        if (typeof window !== "undefined") {
          alert("⚠️ Token already exists");
        }
        return null;
      }

      // Fetch token metadata
      const tokenInfo = await this.fetchTokenMetadata(address);
      if (!tokenInfo) {
        if (typeof window !== "undefined") {
          alert("❌ Failed to fetch token metadata. Please check if this is a valid ERC20 token on Nexus Testnet3.");
        }
        return null;
      }

      // Add to custom tokens
      customTokens.push(tokenInfo);
      localStorage.setItem(this.CUSTOM_TOKENS_KEY, JSON.stringify(customTokens));
      
      if (typeof window !== "undefined") {
        alert(`✅ Successfully added ${tokenInfo.symbol} (${tokenInfo.name})`);
      }
      
      return tokenInfo;
    } catch (error) {
      console.error("Error adding custom token:", error);
      if (typeof window !== "undefined") {
        alert("❌ Failed to add custom token. Please try again.");
      }
      return null;
    }
  }

  // Remove a custom token
  static removeCustomToken(address: string): boolean {
    try {
      if (typeof window === "undefined") return false;
      
      const customTokens = this.getCustomTokens();
      const filtered = customTokens.filter(t => 
        t.address.toLowerCase() !== address.toLowerCase()
      );
      
      localStorage.setItem(this.CUSTOM_TOKENS_KEY, JSON.stringify(filtered));
      
      // Also remove from balances
      const balances = this.getBalances();
      delete balances[address.toLowerCase()];
      this.saveBalances(balances);
      
      return true;
    } catch {
      return false;
    }
  }

  // Find token by address
  static findTokenByAddress(address: string): TokenInfo | undefined {
    const allTokens = this.getAllTokens();
    return allTokens.find(t => 
      t.address.toLowerCase() === address.toLowerCase()
    );
  }

  // Find token by symbol
  static findTokenBySymbol(symbol: string): TokenInfo | undefined {
    const allTokens = this.getAllTokens();
    return allTokens.find(t => t.symbol === symbol);
  }

  // Validate token address format
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Helper function to make eth_call
  static async ethCall(to: string, data: string): Promise<string> {
    const response = await fetch(RPC_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to,
            data,
          },
          "latest",
        ],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.result as string;
  }

  // ERC20 standard ABI for common functions
  private static readonly ERC20_ABI = [
    {
      type: "function",
      name: "name",
      inputs: [],
      outputs: [{ type: "string", name: "" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "symbol",
      inputs: [],
      outputs: [{ type: "string", name: "" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "decimals",
      inputs: [],
      outputs: [{ type: "uint8", name: "" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "balanceOf",
      inputs: [{ type: "address", name: "account" }],
      outputs: [{ type: "uint256", name: "" }],
      stateMutability: "view",
    },
  ] as const;

  // Helper function to encode function call using viem
  static encodeFunctionCall(functionName: string, args: any[] = []): string {
    try {
      const abiItem = this.ERC20_ABI.find(
        (item) => item.type === "function" && item.name === functionName
      );

      if (!abiItem) {
        throw new Error(`Function ${functionName} not found in ERC20 ABI`);
      }

      // Handle each function type explicitly for proper typing
      let encoded: string;
      if (functionName === "name" || functionName === "symbol" || functionName === "decimals") {
        encoded = encodeFunctionData({
          abi: this.ERC20_ABI,
          functionName: functionName as "name" | "symbol" | "decimals",
        });
      } else if (functionName === "balanceOf") {
        if (args.length === 0 || !args[0]) {
          throw new Error("balanceOf requires an address argument");
        }
        encoded = encodeFunctionData({
          abi: this.ERC20_ABI,
          functionName: "balanceOf",
          args: [args[0] as `0x${string}`],
        });
      } else {
        throw new Error(`Unsupported function: ${functionName}`);
      }

      console.log(`   Encoded ${functionName}(${args.join(", ") || ""}): ${encoded}`);
      return encoded;
    } catch (error) {
      console.error(`   Failed to encode ${functionName}:`, error);
      throw new Error(`Failed to encode function ${functionName}: ${error}`);
    }
  }

  // Try multiple chain IDs to find where token exists
  static async tryMultipleChains(address: string): Promise<{ chainId: number; rpcUrl: string } | null> {
    const chains = [
      { chainId: 3945, rpcUrl: "https://testnet.rpc.nexus.xyz" },
      { chainId: 3940, rpcUrl: "https://testnet3.rpc.nexus.xyz" },
      { chainId: 393, rpcUrl: "https://rpc.nexus.xyz/http" },
      { chainId: 9070, rpcUrl: "https://rpc.nexus.testnet.apexfusion.org/" },
    ];

    for (const chain of chains) {
      try {
        console.log(`   Trying chain ${chain.chainId}...`);
        const response = await fetch(chain.rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getCode",
            params: [address, "latest"],
            id: 1,
          }),
        });

        const data = await response.json();
        if (data.result && data.result !== "0x") {
          console.log(`   ✅ Token found on chain ${chain.chainId}`);
          return chain;
        }
      } catch (e) {
        console.log(`   ❌ Chain ${chain.chainId} failed`);
      }
    }

    return null;
  }

  // Fetch ERC20 token metadata using RPC proxy
  static async fetchTokenMetadata(address: string): Promise<TokenInfo | null> {
    if (typeof window === "undefined") return null;

    try {
      console.log(`🔍 Fetching metadata for token: ${address}`);

      // Try to find which chain has this token
      const chainInfo = await this.tryMultipleChains(address);
      if (!chainInfo) {
        console.log("   ❌ Token not found on any known chain");
        return null;
      }

      // Use the chain's RPC directly
      const rpcUrl = chainInfo.rpcUrl;

      // Fetch metadata using eth_call directly on the found chain
      const nameResponse = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{ to: address, data: this.encodeFunctionCall("name") }, "latest"],
          id: 1,
        }),
      });
      const nameData = await nameResponse.json();

      const symbolResponse = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{ to: address, data: this.encodeFunctionCall("symbol") }, "latest"],
          id: 1,
        }),
      });
      const symbolData = await symbolResponse.json();

      const decimalsResponse = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{ to: address, data: this.encodeFunctionCall("decimals") }, "latest"],
          id: 1,
        }),
      });
      const decimalsData = await decimalsResponse.json();

      console.log("   Raw responses:");
      console.log(`     name: ${nameData.result}`);
      console.log(`     symbol: ${symbolData.result}`);
      console.log(`     decimals: ${decimalsData.result}`);

      // Decode string responses (dynamic string type from ABI)
      const decodeString = (hex: string) => {
        if (!hex || hex === "0x") return "";

        console.log(`   Decoding string from hex: ${hex}`);

        // Try multiple decoding strategies

        // Strategy 1: Standard dynamic string (offset=32)
        if (hex.length > 66) {
          try {
            const offsetHex = hex.slice(2, 66);
            const offset = parseInt(offsetHex, 16);

            if (offset === 32) {
              const lengthHex = hex.slice(66, 130);
              const length = parseInt(lengthHex, 16);
              const dataStart = 130;
              const dataEnd = dataStart + (length * 2);

              if (hex.length >= dataEnd && length > 0 && length < 100) {
                const data = hex.slice(dataStart, dataEnd);
                const decoded = Buffer.from(data, "hex").toString("utf8");
                console.log(`   ✅ Decoded via dynamic string: ${decoded}`);
                return decoded;
              }
            }
          } catch (e) {
            console.log(`   Failed dynamic string decode: ${e}`);
          }
        }

        // Strategy 2: Short string (data starts immediately at position 2)
        if (hex.length >= 2 && hex.length <= 64) {
          try {
            // Try even length
            const cleaned = hex.slice(2);
            if (cleaned.length % 2 === 0 && cleaned.length > 0) {
              const decoded = Buffer.from(cleaned, "hex").toString("utf8");
              if (decoded && decoded.trim()) {
                console.log(`   ✅ Decoded via short string: ${decoded}`);
                return decoded;
              }
            }
          } catch (e) {
            console.log(`   Failed short string decode: ${e}`);
          }
        }

        // Strategy 3: String encoded as bytes32 (common for symbols)
        if (hex.length === 66) {
          try {
            // Remove padding zeros and decode
            const cleaned = hex.replace(/^0x/, "").replace(/0+$/, "");
            if (cleaned.length > 0 && cleaned.length % 2 === 0) {
              const decoded = Buffer.from(cleaned, "hex").toString("utf8");
              if (decoded && decoded.trim()) {
                console.log(`   ✅ Decoded via bytes32: ${decoded}`);
                return decoded;
              }
            }
          } catch (e) {
            console.log(`   Failed bytes32 decode: ${e}`);
          }
        }

        console.log(`   ⚠️ Could not decode, returning as-is: ${hex}`);
        return hex;
      };

      const decodeUint8 = (hex: string) => {
        if (!hex || hex === "0x") return 18;
        const parsed = parseInt(hex, 16);
        return isNaN(parsed) ? 18 : parsed;
      };

      const name = decodeString(nameData.result);
      const symbol = decodeString(symbolData.result);
      const decimals = decodeUint8(decimalsData.result);

      const tokenInfo = {
        address,
        name: name || "Unknown Token",
        symbol: symbol || "UNK",
        decimals: decimals || 18,
        isNative: false,
        logoURI: "",
        chainId: chainInfo.chainId,
      };

      console.log(`✅ Successfully fetched metadata:`, tokenInfo);
      return tokenInfo;
    } catch (error) {
      console.error(`❌ Failed to fetch token metadata for ${address}:`, error);
      console.error(`   Make sure this is a valid ERC20 token on Nexus Testnet3 (Chain ID: 3945)`);
      return null;
    }
  }

  // Get token balance for user using fetch with RPC proxy
  static async getTokenBalance(token: TokenInfo, userAddress: string, retryCount = 0): Promise<string> {
    const MAX_RETRIES = 2;

    console.log(`💰 getTokenBalance called for ${token.symbol} to ${userAddress}`);
    console.log(`   token.isNative: ${token.isNative}, attempt: ${retryCount + 1}/${MAX_RETRIES + 1}`);

    if (!userAddress) {
      console.log("❌ No user address!");
      return "0";
    }

    // Validate address format
    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.error("❌ Invalid address format:", userAddress);
      return "0";
    }

    try {
      // For native token, get NEX balance
      if (token.isNative) {
        console.log(`🔍 Getting native NEX balance via RPC proxy for ${userAddress}...`);

        const response = await fetch(RPC_PROXY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [userAddress, "latest"],
            id: Date.now(), // Use timestamp as unique ID
          }),
        });

        if (!response.ok) {
          console.error(`❌ HTTP error! status: ${response.status}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("   RPC response:", data);

        if (data.error) {
          console.error(`❌ RPC error: ${data.error.message}`);
          throw new Error(data.error.message);
        }

        if (!data.result) {
          console.error("❌ No result in RPC response!");
          throw new Error("No result in RPC response");
        }

        const balanceHex = data.result as string;
        console.log(`   Raw balance (hex): ${balanceHex}`);

        // Convert hex to decimal and format
        try {
          // Handle empty response (0x) - treat as 0
          const balanceWei = balanceHex === "0x" || !balanceHex ? BigInt(0) : BigInt(balanceHex);
          const formatted = formatEther(balanceWei);

          console.log(`   Formatted balance: ${formatted}`);
          console.log(`✅ Fetched NEX balance: ${formatted} for ${userAddress}`);
          return formatted;
        } catch (conversionError: any) {
          console.error("❌ Failed to convert balance:", conversionError.message);
          throw new Error(`Failed to convert balance: ${conversionError.message}`);
        }
      } else {
        // For ERC20 tokens
        if (token.address === "0x0000000000000000000000000000000000000000") {
          console.log(`⚠️ Token ${token.symbol} has placeholder address, returning 0`);
          return "0"; // Placeholder address, return 0
        }

        console.log(`🔍 Getting ERC20 ${token.symbol} balance via RPC proxy for ${userAddress}...`);

        // Create balanceOf call data (function selector + address)
        const callData = this.encodeFunctionCall("balanceOf", [userAddress as `0x${string}`]);

        const response = await fetch(RPC_PROXY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [
              {
                to: token.address,
                data: callData,
              },
              "latest",
            ],
            id: 1,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("   RPC response:", data);

        if (data.error) {
          throw new Error(data.error.message);
        }

        const balanceHex = data.result as string;
        console.log(`   Raw balance (hex): ${balanceHex}`);

        // Handle empty response (0x) - treat as 0
        const balanceWei = balanceHex === "0x" || !balanceHex ? BigInt(0) : BigInt(balanceHex);
        const formatted = formatUnits(balanceWei, token.decimals);

        console.log(`✅ Fetched ${token.symbol} balance: ${formatted} for ${userAddress}`);
        return formatted;
      }
    } catch (error) {
      console.error(`❌ Failed to fetch ${token.symbol} balance for ${userAddress}:`, error);

      // Retry logic for network errors
      if (retryCount < MAX_RETRIES) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`⏳ Retrying in ${delay}ms... (attempt ${retryCount + 2}/${MAX_RETRIES + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.getTokenBalance(token, userAddress, retryCount + 1);
      }

      return "0";
    }
  }

  // Get tokens for dropdown (exclude native if needed)
  static getTokensForDropdown(excludeNative = false): TokenInfo[] {
    const allTokens = this.getAllTokens();
    return excludeNative 
      ? allTokens.filter(t => !t.isNative)
      : allTokens;
  }

  // Clear all custom tokens
  static clearCustomTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.CUSTOM_TOKENS_KEY);
      localStorage.removeItem(this.BALANCES_KEY);
    }
  }

  // Get token price in USD (defaults to 1 if not found)
  static getTokenPriceUSD(symbol: string): number {
    return this.TOKEN_PRICES_USD[symbol] || 1;
  }

  // Calculate swap rate between two tokens based on USD prices
  // Formula: fromAmount * (fromTokenPrice / toTokenPrice) = toAmount
  static calculateSwapRate(fromToken: TokenInfo, toToken: TokenInfo, fromAmount: string): string {
    if (!fromAmount || isNaN(Number(fromAmount))) return "0";

    const amount = Number(fromAmount);
    if (amount <= 0) return "0";

    // Get prices in USD
    const fromPrice = this.getTokenPriceUSD(fromToken.symbol);
    const toPrice = this.getTokenPriceUSD(toToken.symbol);

    // Calculate: fromAmount * (fromPrice / toPrice) = toAmount
    // Example: 1 SOL ($150) to NEX ($1) = 1 * (150/1) = 150 NEX
    // Example: 150 NEX ($1) to SOL ($150) = 150 * (1/150) = 1 SOL
    const rate = fromPrice / toPrice;
    const toAmount = amount * rate;

    // Handle decimal precision
    const fromDecimals = fromToken.decimals;
    const toDecimals = toToken.decimals;
    
    // Adjust for decimal differences if needed
    let finalAmount = toAmount;
    if (fromDecimals !== toDecimals) {
      // If decimals differ, we need to account for it
      // But since we're working with prices, the rate already accounts for value
      // Just ensure we don't lose precision
      finalAmount = toAmount;
    }

    return finalAmount.toFixed(18).replace(/\.?0+$/, "");
  }

  // Get formatted exchange rate for display based on USD prices
  static getExchangeRate(fromToken: TokenInfo | null, toToken: TokenInfo | null): string {
    if (!fromToken || !toToken) return "---";

    const fromPrice = this.getTokenPriceUSD(fromToken.symbol);
    const toPrice = this.getTokenPriceUSD(toToken.symbol);
    
    if (fromPrice === 0 || toPrice === 0) {
      return "---";
    }
    
    const rate = fromPrice / toPrice;

    console.log(`📊 Exchange Rate: ${fromToken.symbol} ($${fromPrice}) -> ${toToken.symbol} ($${toPrice}) = ${rate}`);

    // Format rate nicely
    if (rate >= 1) {
      return `1 ${fromToken.symbol} = ${rate.toFixed(6)} ${toToken.symbol}`;
    } else {
      return `1 ${fromToken.symbol} = ${rate.toFixed(8)} ${toToken.symbol}`;
    }
  }
}// Temporary debug - will be removed
