import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployUSDT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n💵 Deploying USDT (Testnet Stablecoin)...");
  console.log("Deployer:", deployer);

  const usdtDeployment = await deploy("USDT", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });

  console.log(`✅ USDT deployed to: ${usdtDeployment.address}`);
  console.log(`   Name: Tether USD`);
  console.log(`   Symbol: USDT`);
  console.log(`   Decimals: 6`);
  console.log(`   Initial Supply: 10,000,000 USDT`);
  console.log(`\n💡 Use USDT as base pair for price reference:`);
  console.log(`   - 1 USDT = $1 USD (reference)`);
  console.log(`   - Create NEX-USDT pool to set NEX price`);
  console.log(`   - Create TOKEN-USDT pools for all tokens`);
  console.log(`   - All prices now have USD value!`);
};

export default deployUSDT;
deployUSDT.tags = ["USDT"];
