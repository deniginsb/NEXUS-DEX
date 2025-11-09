import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployWNEXLEMONPool: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n💧 Deploying WNEX-LEMON AMM Pool...");
  console.log("Deployer:", deployer);

  // Token addresses
  const WNEX_ADDRESS = "0x5A6128e1cF97339cD9C057a940950c02DbeA0B7B";
  const LEMON_ADDRESS = "0x90c81FDf906abCd1c51591261D4181f380CA71b1";

  const poolDeployment = await deploy("TokenPairPool", {
    from: deployer,
    args: [
      WNEX_ADDRESS,
      LEMON_ADDRESS,
      "WNEX-LEMON LP",
      "WNEX-LEMON",
      deployer,
    ],
    log: true,
    autoMine: true,
  });

  console.log(`✅ WNEX-LEMON Pool deployed to: ${poolDeployment.address}`);
  console.log(`\n📊 Pool Details:`);
  console.log(`   Token0 (WNEX): ${WNEX_ADDRESS}`);
  console.log(`   Token1 (LEMON): ${LEMON_ADDRESS}`);
  console.log(`   LP Token: WNEX-LEMON LP`);
  console.log(`   Fee: 0.3%`);
  
  console.log(`\n🔧 Next Steps:`);
  console.log(`   1. Approve WNEX and LEMON to pool`);
  console.log(`   2. Add initial liquidity (e.g., 100 WNEX + 10,000 LEMON)`);
  console.log(`   3. Initial price will be: 1 WNEX = 100 LEMON`);
};

export default deployWNEXLEMONPool;
deployWNEXLEMONPool.tags = ["WNEXLEMONPool"];
