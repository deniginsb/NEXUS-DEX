import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployLiquidityPool: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n📦 Deploying NEX-WNEX Liquidity Pool...");
  console.log("Deployer:", deployer);

  // WNEX Stablecoin address (from previous deployment)
  const WNEX_ADDRESS = "0x5A6128e1cF97339cD9C057a940950c02DbeA0B7B";

  const pool = await deploy("NEXWNEXPool", {
    from: deployer,
    args: [WNEX_ADDRESS, deployer],
    log: true,
    waitConfirmations: 1,
  });

  console.log("✅ NEX-WNEX Liquidity Pool deployed to:", pool.address);
  console.log("\n📝 Pool Details:");
  console.log("   - WNEX Token:", WNEX_ADDRESS);
  console.log("   - LP Token Symbol: NEX-WNEX-LP");
  console.log("   - Fee: 3%");
  console.log("   - Ratio: 1:1 (NEX:WNEX)");

  console.log("\n🔧 Next steps:");
  console.log("   1. Fund pool with initial liquidity");
  console.log("   2. Update frontend with pool address");
  console.log("   3. Test add/remove liquidity functions");
};

export default deployLiquidityPool;
deployLiquidityPool.tags = ["NEXWNEXPool"];
