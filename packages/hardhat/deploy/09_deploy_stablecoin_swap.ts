import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const deployStablecoinSwap: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const { ethers } = hre;

  console.log("\n🚀 Deploying StablecoinSwap Contract...");
  console.log("📝 Deployer:", deployer);

  const deployment = await deploy("StablecoinSwap", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
    waitConfirmations: 2,
  });

  console.log(`✅ StablecoinSwap deployed at: ${deployment.address}`);

  // Read deployed stablecoins
  const stablecoinsPath = join(__dirname, "../deployedStablecoins.json");
  const stablecoins = JSON.parse(readFileSync(stablecoinsPath, "utf-8"));

  console.log("\n📝 Setting swap contract for all stablecoin tokens...");

  // Set this contract as the swap contract for each stablecoin
  for (const [symbol, info] of Object.entries(stablecoins)) {
    try {
      const tokenAddress = (info as any).address;
      const token = await ethers.getContractAt("StablecoinToken", tokenAddress);
      
      console.log(`   Setting swap contract for ${symbol}...`);
      const tx = await token.setSwapContract(deployment.address);
      await tx.wait();
      
      console.log(`   ✅ ${symbol}: Swap contract set`);
    } catch (error: any) {
      console.error(`   ❌ ${symbol}: ${error.message}`);
    }
  }

  // Fund contract with initial liquidity (100,000 NEX)
  console.log("\n💰 Funding StablecoinSwap with 100,000 NEX...");
  try {
    const swapContract = await ethers.getContractAt("StablecoinSwap", deployment.address);
    const fundTx = await swapContract.fundContract({ value: ethers.parseEther("100000") });
    await fundTx.wait();
    console.log("✅ Contract funded with 100,000 NEX");
  } catch (error: any) {
    console.error(`❌ Funding failed: ${error.message}`);
  }

  // Save address
  const outputPath = join(__dirname, "../stablecoinSwapAddress.json");
  writeFileSync(outputPath, JSON.stringify({ address: deployment.address }, null, 2));
  console.log(`\n💾 Saved address to: ${outputPath}`);

  console.log("\n✅ StablecoinSwap deployment complete!");
  console.log(`   Contract: ${deployment.address}`);
  console.log(`   Explorer: https://nexus.testnet.blockscout.com/address/${deployment.address}`);
};

export default deployStablecoinSwap;
deployStablecoinSwap.tags = ["StablecoinSwap"];
