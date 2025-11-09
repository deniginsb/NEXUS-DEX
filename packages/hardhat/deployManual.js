const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying NativeNEXSwap contract...");
    
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    // Deploy NEXA
    const NEXA = await hre.ethers.getContractFactory("NEXA");
    const nexa = await NEXA.deploy();
    await nexa.deployed();
    console.log("✅ NEXA deployed to:", nexa.address);
    
    // Deploy NEXB
    const NEXB = await hre.ethers.getContractFactory("NEXB");
    const nexb = await NEXB.deploy();
    await nexb.deployed();
    console.log("✅ NEXB deployed to:", nexb.address);
    
    // Deploy WNEX
    const WNEX = await hre.ethers.getContractFactory("WNEX");
    const wnex = await WNEX.deploy();
    await wnex.deployed();
    console.log("✅ WNEX deployed to:", wnex.address);
    
    // Deploy NativeNEXSwap
    const NativeNEXSwap = await hre.ethers.getContractFactory("NativeNEXSwap");
    const nativeSwap = await NativeNEXSwap.deploy(
        nexa.address,
        nexb.address,
        wnex.address,
        deployer.address
    );
    await nativeSwap.deployed();
    console.log("✅ NativeNEXSwap deployed to:", nativeSwap.address);
    
    console.log("\n🎉 All contracts deployed successfully!");
    console.log("Update your frontend with these addresses:");
    console.log("NEXA:", nexa.address);
    console.log("NEXB:", nexb.address);
    console.log("WNEX:", wnex.address);
    console.log("NativeNEXSwap:", nativeSwap.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
