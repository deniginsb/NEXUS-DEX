import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

const TOKENS = [
  { name: "BITCOIN", symbol: "BTC", supply: "21000000" },
  { name: "ETHEREUM", symbol: "ETH", supply: "120000000" },
  { name: "SOLANA", symbol: "SOL", supply: "500000000" },
  { name: "CARDANO", symbol: "ADA", supply: "45000000000" },
  { name: "POLYGON", symbol: "MATIC", supply: "10000000000" },
  { name: "CHAINLINK", symbol: "LINK", supply: "1000000000" },
  { name: "AVALANCHE", symbol: "AVAX", supply: "720000000" },
  { name: "UNISWAP", symbol: "UNI", supply: "1000000000" },
  { name: "DOGECOIN", symbol: "DOGE", supply: "141000000000" },
  { name: "SHIBA", symbol: "SHIB", supply: "589000000000000" },
  { name: "LITECOIN", symbol: "LTC", supply: "84000000" },
  { name: "BINANCE", symbol: "BNB", supply: "200000000" },
  { name: "TETHER", symbol: "USDT", supply: "100000000000" },
  { name: "RIPPLE", symbol: "XRP", supply: "100000000000" },
  { name: "POLKADOT", symbol: "DOT", supply: "1400000000" },
  { name: "USDC", symbol: "USDC", supply: "50000000000" },
  { name: "ATOM", symbol: "ATOM", supply: "300000000" },
  { name: "ALGO", symbol: "ALGO", supply: "10000000000" },
  { name: "NEAR", symbol: "NEAR", supply: "1000000000" },
  { name: "FTM", symbol: "FTM", supply: "3175000000" },
  { name: "AAVE", symbol: "AAVE", supply: "16000000" },
  { name: "SAND", symbol: "SAND", supply: "3000000000" },
];

async function main() {
  console.log("🚀 Deploying All Popular Tokens to Nexus Testnet3...\n");
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "NEX\n");

  const deployedAddresses: Record<string, string> = {};
  const ERC20Factory = await ethers.getContractFactory("ERC20Token");

  for (const token of TOKENS) {
    try {
      console.log(`📦 Deploying ${token.symbol}...`);
      const supply = ethers.parseEther(token.supply);
      const tokenContract = await ERC20Factory.deploy(
        token.name,
        token.symbol,
        supply,
        deployer.address
      );
      await tokenContract.waitForDeployment();
      const address = await tokenContract.getAddress();
      deployedAddresses[token.symbol] = address;
      console.log(`   ✅ ${token.symbol}: ${address}\n`);
    } catch (error: any) {
      console.error(`   ❌ ${token.symbol}:`, error.message);
    }
  }

  const outputPath = join(__dirname, "../deployedPopularTokens.json");
  writeFileSync(outputPath, JSON.stringify(deployedAddresses, null, 2));
  console.log(`\n💾 Saved to: ${outputPath}`);
  console.log("\n📋 Deployed Tokens:");
  for (const [symbol, address] of Object.entries(deployedAddresses)) {
    console.log(`   ${symbol.padEnd(10)}: ${address}`);
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
