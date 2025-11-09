import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployLEMON: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n🍋 Deploying LEMON Token...");
  console.log("Deployer:", deployer);

  const lemonDeployment = await deploy("LEMON", {
    from: deployer,
    args: [deployer], // initialOwner
    log: true,
    autoMine: true,
  });

  console.log(`✅ LEMON Token deployed to: ${lemonDeployment.address}`);
  console.log(`   Name: Lemon Token`);
  console.log(`   Symbol: LEMON`);
  console.log(`   Decimals: 18`);
  console.log(`   Initial Supply: 1,000,000 LEMON`);
};

export default deployLEMON;
deployLEMON.tags = ["LEMON"];
