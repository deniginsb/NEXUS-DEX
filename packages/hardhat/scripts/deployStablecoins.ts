import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

// Token list dengan harga dalam NEX (NEX = 1, jadi harga USD = harga NEX)
// priceInNEX dalam wei (18 decimals), contoh: 150e18 = 150 NEX per token
const TOKENS = [
  { name: "BITCOIN", symbol: "BTC", priceNEX: "60000" }, // $60k = 60k NEX
  { name: "ETHEREUM", symbol: "ETH", priceNEX: "3000" },
  { name: "SOLANA", symbol: "SOL", priceNEX: "150" },
  { name: "CARDANO", symbol: "ADA", priceNEX: "0.5" },
  { name: "POLYGON", symbol: "MATIC", priceNEX: "0.8" },
  { name: "CHAINLINK", symbol: "LINK", priceNEX: "15" },
  { name: "AVALANCHE", symbol: "AVAX", priceNEX: "40" },
  { name: "UNISWAP", symbol: "UNI", priceNEX: "8" },
  { name: "DOGECOIN", symbol: "DOGE", priceNEX: "0.1" },
  { name: "SHIBA", symbol: "SHIB", priceNEX: "0.00001" },
  { name: "LITECOIN", symbol: "LTC", priceNEX: "80" },
  { name: "BINANCE", symbol: "BNB", priceNEX: "600" },
  { name: "TETHER", symbol: "USDT", priceNEX: "1" },
  { name: "RIPPLE", symbol: "XRP", priceNEX: "0.6" },
  { name: "POLKADOT", symbol: "DOT", priceNEX: "7" },
  { name: "USDC", symbol: "USDC", priceNEX: "1" },
  { name: "ATOM", symbol: "ATOM", priceNEX: "10" },
  { name: "ALGO", symbol: "ALGO", priceNEX: "0.2" },
  { name: "NEAR", symbol: "NEAR", priceNEX: "4" },
  { name: "FTM", symbol: "FTM", priceNEX: "0.4" },
  { name: "AAVE", symbol: "AAVE", priceNEX: "100" },
  { name: "SAND", symbol: "SAND", priceNEX: "0.5" },
];

async function main() {
  console.log("🚀 Deploying Stablecoin Tokens (NEX-backed) to Nexus Testnet3...\n");
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "NEX\n");

  const deployedAddresses: Record<string, string> = {};
  const StablecoinFactory = await ethers.getContractFactory("StablecoinToken");

  for (const token of TOKENS) {
    try {
      console.log(`📦 Deploying ${token.symbol} (${token.name})...`);
      const priceInNEX = ethers.parseEther(token.priceNEX);
      const stablecoin = await StablecoinFactory.deploy(
        token.name,
        token.symbol,
        priceInNEX,
        deployer.address
      );
      await stablecoin.waitForDeployment();
      const address = await stablecoin.getAddress();
      deployedAddresses[token.symbol] = address;
      console.log(`   ✅ ${token.symbol}: ${address}`);
      console.log(`   💰 Price: ${token.priceNEX} NEX per ${token.symbol}\n`);
    } catch (error: any) {
      console.error(`   ❌ ${token.symbol}:`, error.message);
    }
  }

  const outputPath = join(__dirname, "../deployedStablecoins.json");
  writeFileSync(outputPath, JSON.stringify(deployedAddresses, null, 2));
  console.log(`\n💾 Saved to: ${outputPath}`);
  console.log("\n📋 Deployed Stablecoins:");
  for (const [symbol, address] of Object.entries(deployedAddresses)) {
    console.log(`   ${symbol.padEnd(10)}: ${address}`);
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
