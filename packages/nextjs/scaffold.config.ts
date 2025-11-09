import * as chains from "viem/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  rpcOverrides?: Record<number, string>;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

export const DEFAULT_ALCHEMY_API_KEY = "cR4WnXePioePZ5fFrnSiR";

// Nexus Testnet3 Chain Definition
const nexusTestnet = {
  ...chains.hardhat,
  id: 3945,
  name: "Nexus Testnet3",
  nativeCurrency: {
    decimals: 18,
    name: "Nexus Token",
    symbol: "NEX",
  },
  rpcUrls: {
    default: { http: ["https://testnet.rpc.nexus.xyz"] },
    public: { http: ["https://testnet.rpc.nexus.xyz"] },
  },
  blockExplorers: {
    default: {
      name: "Nexus Blockscout",
      url: "https://nexus.testnet.blockscout.com/",
    },
  },
} as const;

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [nexusTestnet],

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY,

  // If you want to use a different RPC for a specific network, you can add it here.
  // The key is the chain ID, and the value is the HTTP RPC URL
  rpcOverrides: {
    [nexusTestnet.id]: "https://testnet.rpc.nexus.xyz",
    // Example:
    // [chains.mainnet.id]: "https://mainnet.rpc.buidlguidl.com",
  },

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // Disable burner wallet completely - require real wallet connection
  onlyLocalBurnerWallet: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
