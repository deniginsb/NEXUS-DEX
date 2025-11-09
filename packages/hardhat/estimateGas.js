const hre = require("hardhat");

async function main() {
    console.log("⛽ ESTIMATING GAS FOR DEPLOYMENT\n");
    
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);
    
    // Estimate NEXA deployment
    const NEXA = await hre.ethers.getContractFactory("NEXA");
    const nexaDeploy = await NEXA.getDeployTransaction();
    console.log("\nNEXA Deployment:");
    console.log("   Gas Estimate:", nexaDeploy.gasLimit?.toString() || "N/A");
    
    // Estimate NativeNEXSwap deployment
    const NativeNEXSwap = await hre.ethers.getContractFactory("NativeNEXSwap");
    const swapDeployTx = await NativeNEXSwap.getDeployTransaction(
        "0x054db41597F6eFb8515E355E3017FfEF635cEBF5",
        "0x865D0e51191FBA553bd329074b64d652357b238C",
        "0xF28c0151bEdEA14fa358bA049CB946f631c5607d",
        deployer.address
    );
    console.log("\nNativeNEXSwap Deployment:");
    console.log("   Gas Estimate:", swapDeployTx.gasLimit?.toString() || "N/A");
    console.log("   Data Length:", swapDeployTx.data?.length || 0, "bytes");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
