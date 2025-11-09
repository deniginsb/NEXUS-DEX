import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployAllTokens: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n🪙 Deploying All Tokens...");
  console.log("Deployer:", deployer);

  const tokens = [
    "DOGE", "SHIB", "PEPE", "LINK", "UNI", 
    "MATIC", "AVAX", "ARB", "OP", "SOL", "BNB"
  ];

  const deployedAddresses: Record<string, string> = {};

  for (const token of tokens) {
    console.log(`\n📦 Deploying ${token}...`);
    const deployment = await deploy(token, {
      from: deployer,
      args: [deployer],
      log: true,
      autoMine: true,
    });
    deployedAddresses[token] = deployment.address;
    console.log(`   ✅ ${token}: ${deployment.address}`);
  }

  console.log("\n✅ All tokens deployed!");
  console.log("\n📋 Summary:");
  for (const [token, address] of Object.entries(deployedAddresses)) {
    console.log(`   ${token.padEnd(6)}: ${address}`);
  }
};

export default deployAllTokens;
deployAllTokens.tags = ["AllTokens"];
