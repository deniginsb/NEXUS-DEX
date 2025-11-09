import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { writeFileSync } from "fs";
import { join } from "path";

const deployMultiTokenSwap: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  console.log("\n🚀 Deploying Multi Token Swap System...\n");
  console.log(`Network: ${network.name}`);
  console.log(`Deployer: ${deployer}\n`);

  // Deploy WNEX Token (stablecoin)
  console.log("📦 Deploying WNEX Token (Stablecoin)...");
  const wnexToken = await deploy("WNEX", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ WNEX deployed: ${wnexToken.address}\n`);

  // Deploy all other tokens
  const tokenContracts = [
    "BITCOIN", "ETHEREUM", "SOLANA", "CARDANO", "POLYGON",
    "CHAINLINK", "AVALANCHE", "UNISWAP", "DOGECOIN", "SHIBA",
    "LITECOIN", "BINANCE", "TETHER", "RIPPLE", "POLKADOT"
  ];

  const deployedTokens = [];
  const tokenSymbols = [];

  for (const tokenName of tokenContracts) {
    console.log(`📦 Deploying ${tokenName} Token...`);
    const token = await deploy(tokenName, {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: 1,
    });
    deployedTokens.push(token.address);
    tokenSymbols.push(tokenName);
    console.log(`✅ ${tokenName} deployed: ${token.address}`);
  }

  console.log("\n📦 Deploying MultiTokenSwap Contract...");
  const multiSwap = await deploy("MultiTokenSwap", {
    from: deployer,
    args: [
      wnexToken.address,
      deployer
    ],
    log: true,
    waitConfirmations: 1,
  });
  console.log(`✅ MultiTokenSwap deployed: ${multiSwap.address}\n`);

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer,
    deployedAt: new Date().toISOString(),
    contracts: {
      WNEX: {
        address: wnexToken.address,
        name: "Wrapped NEX",
        symbol: "WNEX",
        decimals: 18,
        type: "stablecoin"
      },
      MultiTokenSwap: {
        address: multiSwap.address,
        name: "Multi Token Swap",
        description: "Universal swap contract for all tokens"
      }
    },
    tokens: {}
  };

  // Add all tokens to deployment info
  for (let i = 0; i < tokenContracts.length; i++) {
    deploymentInfo.tokens[tokenContracts[i]] = {
      address: deployedTokens[i],
      name: tokenContracts[i],
      symbol: tokenContracts[i],
      decimals: 18,
      type: "erc20"
    };
  }

  // Write detailed deployment info
  const deploymentPath = join(__dirname, "../multiTokenDeployment.json");
  writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to: ${deploymentPath}\n`);

  // Create simple addresses file for frontend
  const simpleAddresses = {
    WNEX: wnexToken.address,
    MultiTokenSwap: multiSwap.address,
    ...Object.fromEntries(
      tokenContracts.map((name, i) => [name, deployedTokens[i]])
    )
  };

  const addressesPath = join(__dirname, "../deployedAddresses.json");
  writeFileSync(addressesPath, JSON.stringify(simpleAddresses, null, 2));

  // Print summary
  console.log("=".repeat(80));
  console.log("🎉 MULTI TOKEN SWAP DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(80));
  console.log("\n📍 Key Contract Addresses:");
  console.log(`   WNEX (Stablecoin):   ${wnexToken.address}`);
  console.log(`   MultiTokenSwap:      ${multiSwap.address}`);
  console.log("\n🪙 Deployed Tokens:");
  for (let i = 0; i < tokenContracts.length; i++) {
    console.log(`   ${tokenContracts[i].padEnd(12)}: ${deployedTokens[i]}`);
  }
  console.log("\n🎯 Key Features:");
  console.log("   ✅ WNEX Stablecoin (NEX ↔ WNEX mint/burn)");
  console.log("   ✅ 15 Trading tokens (all 18 decimals)");
  console.log("   ✅ Universal swap (any token ↔ any token)");
  console.log("   ✅ 1:1 swap rates for all pairs");
  console.log("   ✅ 3% swap fee");
  console.log("   ✅ No liquidity constraints");
  console.log("\n💡 Next Steps:");
  console.log("   1. Add tokens to MultiTokenSwap contract");
  console.log("   2. Fund contract with initial token supply");
  console.log("   3. Update frontend token registry");
  console.log("   4. Test all swap functions");
  console.log("=" .repeat(80));
};

export default deployMultiTokenSwap;
deployMultiTokenSwap.tags = ["MultiTokenSwap"];