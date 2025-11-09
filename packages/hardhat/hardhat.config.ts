import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    nexus: {
      url: "https://testnet.rpc.nexus.xyz",
      chainId: 3945,
      accounts: ["60db03c827a47bdf7fd8601242247333cbf71ca9688a3297f6cccd4f0ab9456a"],
      timeout: 60000,
      confirmations: 2,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: {
      nexus: "nexus",
    },
    customChains: [
      {
        network: "nexus",
        chainId: 3945,
        urls: {
          apiURL: "https://testnet.nexus.xyz/api",
          browserURL: "https://testnet.nexus.xyz",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
