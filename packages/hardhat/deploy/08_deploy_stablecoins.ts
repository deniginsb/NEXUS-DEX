import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { writeFileSync } from "fs";
import { join } from "path";

const deployStablecoins: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { ethers } = hre;

  console.log("\n🚀 Deploying Stablecoin Tokens (NEX-backed) to Nexus Testnet3...");
  console.log("\n📝 Deployer:", deployer);
  const deployerBalance = await ethers.provider.getBalance(deployer);
  console.log(`💰 Balance: ${ethers.formatEther(deployerBalance)} NEX`);

  // All stablecoin tokens with their prices in NEX (based on real USD prices, NEX = $1)
  const stablecoinConfigs = [
    { symbol: "BTC", name: "Bitcoin", priceInNEX: 60000 },
    { symbol: "ETH", name: "Ethereum", priceInNEX: 3400 },
    { symbol: "SOL", name: "Solana", priceInNEX: 150 },
    { symbol: "ADA", name: "Cardano", priceInNEX: 0.5 },
    { symbol: "MATIC", name: "Polygon", priceInNEX: 0.8 },
    { symbol: "LINK", name: "Chainlink", priceInNEX: 15 },
    { symbol: "AVAX", name: "Avalanche", priceInNEX: 40 },
    { symbol: "UNI", name: "Uniswap", priceInNEX: 8 },
    { symbol: "DOGE", name: "Dogecoin", priceInNEX: 0.1 },
    { symbol: "SHIB", name: "Shiba Inu", priceInNEX: 0.00001 },
    { symbol: "LTC", name: "Litecoin", priceInNEX: 80 },
    { symbol: "BNB", name: "Binance Coin", priceInNEX: 600 },
    { symbol: "USDT", name: "Tether", priceInNEX: 1 },
    { symbol: "XRP", name: "Ripple", priceInNEX: 0.6 },
    { symbol: "DOT", name: "Polkadot", priceInNEX: 7 },
    { symbol: "USDC", name: "USD Coin", priceInNEX: 1 },
    { symbol: "ATOM", name: "Cosmos", priceInNEX: 10 },
    { symbol: "ALGO", name: "Algorand", priceInNEX: 0.2 },
    { symbol: "NEAR", name: "NEAR Protocol", priceInNEX: 4 },
    { symbol: "FTM", name: "Fantom", priceInNEX: 0.4 },
    { symbol: "AAVE", name: "Aave", priceInNEX: 100 },
    { symbol: "SAND", name: "The Sandbox", priceInNEX: 0.5 },
  ];

  const deployedAddresses: Record<string, { address: string; priceInNEX: number }> = {};

  for (const config of stablecoinConfigs) {
    console.log(`\n📦 Deploying ${config.symbol} (${config.name})...`);
    console.log(`   Price: 1 ${config.symbol} = ${config.priceInNEX} NEX`);
    
    try {
      // Convert price to wei (18 decimals)
      const priceInWei = ethers.parseEther(config.priceInNEX.toString());
      
      const deployment = await deploy(config.symbol, {
        contract: "StablecoinToken",
        from: deployer,
        args: [config.name, config.symbol, priceInWei, deployer],
        log: true,
        autoMine: true,
        waitConfirmations: 2,
      });
      
      deployedAddresses[config.symbol] = {
        address: deployment.address,
        priceInNEX: config.priceInNEX,
      };
      
      console.log(`   ✅ ${config.symbol}: ${deployment.address}`);
    } catch (error: any) {
      console.error(`   ❌ ${config.symbol} deployment failed: ${error.message || "Unknown error"}`);
    }
  }

  // Save to JSON file
  const addressesPath = join(__dirname, "../deployedStablecoins.json");
  writeFileSync(addressesPath, JSON.stringify(deployedAddresses, null, 2));
  console.log(`\n💾 Saved to: ${addressesPath}`);

  console.log("\n📋 Deployed Stablecoins Summary:");
  console.log("=".repeat(80));
  for (const [token, info] of Object.entries(deployedAddresses)) {
    console.log(`${token.padEnd(8)}: ${info.address} (1 ${token} = ${info.priceInNEX} NEX)`);
  }
  console.log("=".repeat(80));
  
  console.log(`\n✅ Successfully deployed ${Object.keys(deployedAddresses).length} stablecoin tokens!`);
};

export default deployStablecoins;
deployStablecoins.tags = ["Stablecoins"];
