const hre = require("hardhat");

async function main() {
    console.log("🚀 STEP-BY-STEP DEPLOYMENT");
    console.log("=".repeat(60));

    const [deployer] = await hre.ethers.getSigners();
    console.log("\nDeployer:", deployer.address);
    console.log("Network: Nexus Testnet3 (Chain ID: 3945)");

    // STEP 1: Deploy NEXA
    console.log("\n" + "=".repeat(60));
    console.log("STEP 1: Deploy NEXA Token");
    console.log("=".repeat(60));

    const NEXA = await hre.ethers.getContractFactory("NEXA");
    console.log("Deploying NEXA...");
    const nexa = await NEXA.deploy();
    console.log("Transaction sent:", nexa.deploymentTransaction()?.hash || "pending");
    console.log("Waiting for deployment...");
    await nexa.waitForDeployment();
    console.log("✅ NEXA deployed at:", await nexa.getAddress());

    // STEP 2: Deploy NEXB
    console.log("\n" + "=".repeat(60));
    console.log("STEP 2: Deploy NEXB Token");
    console.log("=".repeat(60));

    const NEXB = await hre.ethers.getContractFactory("NEXB");
    console.log("Deploying NEXB...");
    const nexb = await NEXB.deploy();
    console.log("Transaction sent:", nexb.deploymentTransaction()?.hash || "pending");
    console.log("Waiting for deployment...");
    await nexb.waitForDeployment();
    console.log("✅ NEXB deployed at:", await nexb.getAddress());

    // STEP 3: Deploy WNEX
    console.log("\n" + "=".repeat(60));
    console.log("STEP 3: Deploy WNEX Token");
    console.log("=".repeat(60));

    const WNEX = await hre.ethers.getContractFactory("WNEX");
    console.log("Deploying WNEX...");
    const wnex = await WNEX.deploy();
    console.log("Transaction sent:", wnex.deploymentTransaction()?.hash || "pending");
    console.log("Waiting for deployment...");
    await wnex.waitForDeployment();
    console.log("✅ WNEX deployed at:", await wnex.getAddress());

    // STEP 4: Deploy NativeNEXSwap
    console.log("\n" + "=".repeat(60));
    console.log("STEP 4: Deploy NativeNEXSwap Contract");
    console.log("=".repeat(60));

    const NativeNEXSwap = await hre.ethers.getContractFactory("NativeNEXSwap");
    const nexaAddress = await nexa.getAddress();
    const nexbAddress = await nexb.getAddress();
    const wnexAddress = await wnex.getAddress();

    console.log("Deploying NativeNEXSwap with parameters:");
    console.log("  NEXA:", nexaAddress);
    console.log("  NEXB:", nexbAddress);
    console.log("  WNEX:", wnexAddress);
    console.log("  Owner:", deployer.address);

    const nativeSwap = await NativeNEXSwap.deploy(
        nexaAddress,
        nexbAddress,
        wnexAddress,
        deployer.address
    );

    console.log("\nTransaction sent:", nativeSwap.deploymentTransaction()?.hash || "pending");
    console.log("Waiting for deployment...");
    console.log("This may take 30-60 seconds...");

    await nativeSwap.waitForDeployment();
    console.log("✅ NativeNEXSwap deployed at:", await nativeSwap.getAddress());

    // VERIFICATION
    console.log("\n" + "=".repeat(60));
    console.log("VERIFICATION");
    console.log("=".repeat(60));

    const nativeSwapAddress = await nativeSwap.getAddress();

    console.log("\n✅ All contracts deployed successfully!");
    console.log("\nContract Addresses:");
    console.log("  NEXA:         ", nexaAddress);
    console.log("  NEXB:         ", nexbAddress);
    console.log("  WNEX:         ", wnexAddress);
    console.log("  NativeNEXSwap:", nativeSwapAddress);

    console.log("\nNext Steps:");
    console.log("1. Verify contracts on blockchain explorer");
    console.log("2. Update frontend with new addresses");
    console.log("3. Test swap functionality");
    console.log("4. Update deployedAddresses.json");

    // Save to file
    const fs = require("fs");
    const addresses = {
        NEXA: nexaAddress,
        NEXB: nexbAddress,
        WNEX: wnexAddress,
        NativeNEXSwap: nativeSwapAddress
    };

    fs.writeFileSync(
        "./deployedAddresses.json",
        JSON.stringify(addresses, null, 2)
    );
    console.log("\n✅ Addresses saved to deployedAddresses.json");
}

main()
    .then(() => {
        console.log("\n" + "=".repeat(60));
        console.log("🎉 DEPLOYMENT COMPLETE!");
        console.log("=".repeat(60));
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ DEPLOYMENT FAILED:");
        console.error(error);
        process.exit(1);
    });
