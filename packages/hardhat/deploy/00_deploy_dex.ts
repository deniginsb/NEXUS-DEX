import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { writeFileSync } from "fs";
import { join } from "path";

const deployDex: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  console.log("\n🚀 Deploying Native NEX Swap Contract Suite...\n");
  console.log(`Network: ${network.name}`);
  console.log(`Deployer: ${deployer}\n`);

  // Deploy NEXA Token
  console.log("📦 Deploying NEXA Token...");
  const nexaToken = await deploy("NEXA", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ NEXA deployed: ${nexaToken.address}\n`);

  // Deploy NEXB Token
  console.log("📦 Deploying NEXB Token...");
  const nexbToken = await deploy("NEXB", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ NEXB deployed: ${nexbToken.address}\n`);

  // Deploy WNEX Token
  console.log("📦 Deploying WNEX Token...");
  const wnexToken = await deploy("WNEX", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ WNEX deployed: ${wnexToken.address}\n`);

  // Deploy NativeNEXSwap Contract
  console.log("📦 Deploying NativeNEXSwap Contract...");
  const nativeSwap = await deploy("NativeNEXSwap", {
    from: deployer,
    args: [
      nexaToken.address,
      nexbToken.address,
      wnexToken.address,
      deployer
    ],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ NativeNEXSwap deployed: ${nativeSwap.address}\n`);

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer,
    deployedAt: new Date().toISOString(),
    contracts: {
      NEXA: {
        address: nexaToken.address,
        name: "NEXA Token",
        symbol: "NEXA",
        decimals: 6
      },
      NEXB: {
        address: nexbToken.address,
        name: "NEXB Token",
        symbol: "NEXB",
        decimals: 6
      },
      WNEX: {
        address: wnexToken.address,
        name: "Wrapped NEX",
        symbol: "WNEX",
        decimals: 18
      },
      NativeNEXSwap: {
        address: nativeSwap.address,
        name: "Native NEX Swap",
        description: "Multi-swap contract supporting native NEX and ERC20 tokens",
        features: [
          "Direct NEX native swaps (no wrap needed!)",
          "ERC20 token swaps",
          "Admin-controlled swap rates",
          "Fee collection system",
          "Multiple token pairs"
        ]
      }
    }
  };

  // Write to JSON file
  const deploymentPath = join(__dirname, "../nativeSwapAddresses.json");
  writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to: ${deploymentPath}\n`);

  // Also update the main deployedAddresses.json for frontend compatibility
  const simpleAddresses = {
    NEXA: nexaToken.address,
    NEXB: nexbToken.address,
    WNEX: wnexToken.address,
    NativeNEXSwap: nativeSwap.address
  };
  const addressesPath = join(__dirname, "../deployedAddresses.json");
  writeFileSync(addressesPath, JSON.stringify(simpleAddresses, null, 2));

  // Print summary
  console.log("=".repeat(80));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(80));
  console.log("\n📍 Contract Addresses:");
  console.log(`   NEXA Token:          ${nexaToken.address}`);
  console.log(`   NEXB Token:          ${nexbToken.address}`);
  console.log(`   WNEX Token:          ${wnexToken.address}`);
  console.log(`   NativeNEXSwap:       ${nativeSwap.address}`);
  console.log("\n🎯 Key Features:");
  console.log("   ✅ Direct NEX native swaps (no wrap needed!)");
  console.log("   ✅ ERC20 token swaps (NEXA, NEXB, WNEX)");
  console.log("   ✅ Admin-controlled swap rates");
  console.log("   ✅ Fee collection system (3% default)");
  console.log("   ✅ Multiple token pairs supported");
  console.log("\n💡 How to Use:");
  console.log("   • Swap NEX native directly to NEXA/NEXB/WNEX");
  console.log("   • Swap between ERC20 tokens");
  console.log("   • Admin can update rates via updateSwapRate()");
  console.log("   • Admin can update fee via updateFee()");
  console.log("   • Admin can withdraw fees via withdrawTokens()");
  console.log("\n🔗 Admin Functions:");
  console.log(`   updateSwapRate(address fromToken, address toToken, uint256 newRate)`);
  console.log(`   updateFee(uint256 newFee)`); // in basis points
  console.log(`   withdrawTokens(address token, uint256 amount)`);
  console.log("=".repeat(80));
};

export default deployDex;
