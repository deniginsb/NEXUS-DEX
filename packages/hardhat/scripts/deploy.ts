import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  console.log("🚀 Starting deployment to Nexus Testnet...\n");

  // Deploy NEXA token (6 decimals)
  console.log("📝 Deploying NEXA token...");
  const NEXA = await ethers.getContractFactory("NEXA");
  const nexa = await NEXA.deploy();
  await nexa.waitForDeployment();
  const nexaAddress = await nexa.getAddress();
  console.log(`✅ NEXA deployed at: ${nexaAddress}`);

  // Deploy NEXB token (6 decimals)
  console.log("📝 Deploying NEXB token...");
  const NEXB = await ethers.getContractFactory("NEXB");
  const nexb = await NEXB.deploy();
  await nexb.waitForDeployment();
  const nexbAddress = await nexb.getAddress();
  console.log(`✅ NEXB deployed at: ${nexbAddress}`);

  // Deploy WNEX token (18 decimals)
  console.log("📝 Deploying WNEX token...");
  const WNEX = await ethers.getContractFactory("WNEX");
  const wnex = await WNEX.deploy();
  await wnex.waitForDeployment();
  const wnexAddress = await wnex.getAddress();
  console.log(`✅ WNEX deployed at: ${wnexAddress}`);

  // Deploy TokenSwap contract
  console.log("📝 Deploying TokenSwap contract...");
  const TokenSwap = await ethers.getContractFactory("TokenSwap");
  const tokenSwap = await TokenSwap.deploy(nexaAddress, nexbAddress, wnexAddress);
  await tokenSwap.waitForDeployment();
  const tokenSwapAddress = await tokenSwap.getAddress();
  console.log(`✅ TokenSwap deployed at: ${tokenSwapAddress}`);

  // Save deployed addresses to JSON file
  const deployedAddresses = {
    NEXA: nexaAddress,
    NEXB: nexbAddress,
    WNEX: wnexAddress,
    TokenSwap: tokenSwapAddress,
  };

  const addressesPath = join(__dirname, "../deployedAddresses.json");
  writeFileSync(addressesPath, JSON.stringify(deployedAddresses, null, 2));
  console.log(`\n💾 Deployed addresses saved to: ${addressesPath}`);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log(`NEXA (TokenA):      ${nexaAddress}`);
  console.log(`NEXB (TokenB):      ${nexbAddress}`);
  console.log(`WNEX (Wrapped):     ${wnexAddress}`);
  console.log(`TokenSwap:          ${tokenSwapAddress}`);
  console.log("=".repeat(60));
  console.log("\n📋 Next steps:");
  console.log("1. Update tokenRegistry.ts with these addresses");
  console.log("2. Update swap page with TokenSwap contract address");
  console.log("3. Test the swap functionality");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
