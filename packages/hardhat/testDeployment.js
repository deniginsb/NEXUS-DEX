const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🔍 TESTING DEPLOYMENT");
    console.log("=".repeat(60));

    // Load deployed addresses
    const addresses = JSON.parse(fs.readFileSync("./deployedAddresses.json", "utf8"));
    console.log("\nLoaded addresses:", addresses);

    // Get contract instances
    const nativeSwap = await hre.ethers.getContractAt("NativeNEXSwap", addresses.NativeNEXSwap);
    const nexa = await hre.ethers.getContractAt("NEXA", addresses.NEXA);
    const nexb = await hre.ethers.getContractAt("NEXB", addresses.NEXB);
    const wnex = await hre.ethers.getContractAt("WNEX", addresses.WNEX);

    console.log("\n1. CHECKING OWNER:");
    try {
        const owner = await nativeSwap.owner();
        console.log(`   Owner: ${owner}`);
        console.log(`   Status: ${owner === "0x3AA94D0Ec6D89bC6C8abA1638B32e118533D2Bf3" ? "✅ CORRECT" : "❌ WRONG"}`);
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    console.log("\n2. CHECKING TOKEN SUPPORT:");
    try {
        const nexaSupported = await nativeSwap.isTokenSupported(addresses.NEXA);
        const nexbSupported = await nativeSwap.isTokenSupported(addresses.NEXB);
        const wnexSupported = await nativeSwap.isTokenSupported(addresses.WNEX);
        console.log(`   NEXA: ${nexaSupported ? "✅ SUPPORTED" : "❌ NOT SUPPORTED"}`);
        console.log(`   NEXB: ${nexbSupported ? "✅ SUPPORTED" : "❌ NOT SUPPORTED"}`);
        console.log(`   WNEX: ${wnexSupported ? "✅ SUPPORTED" : "❌ NOT SUPPORTED"}`);
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    console.log("\n3. CHECKING SWAP RATES:");
    try {
        const nexToNexa = await nativeSwap.getSwapRate("0x0000000000000000000000000000000000000000", addresses.NEXA);
        const nexToWnex = await nativeSwap.getSwapRate("0x0000000000000000000000000000000000000000", addresses.WNEX);
        const nexaToWnex = await nativeSwap.getSwapRate(addresses.NEXA, addresses.WNEX);

        console.log(`   NEX → NEXA: ${nexToNexa.toString()}`);
        console.log(`   NEX → WNEX: ${nexToWnex.toString()}`);
        console.log(`   NEXA → WNEX: ${nexaToWnex.toString()}`);
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    console.log("\n4. CHECKING CONTRACT BALANCES:");
    try {
        const [deployer] = await hre.ethers.getSigners();
        const nexaBalance = await nexa.balanceOf(deployer.address);
        const nexbBalance = await nexb.balanceOf(deployer.address);
        const wnexBalance = await wnex.balanceOf(deployer.address);

        console.log(`   NEXA balance: ${hre.ethers.formatUnits(nexaBalance, 6)}`);
        console.log(`   NEXB balance: ${hre.ethers.formatUnits(nexbBalance, 6)}`);
        console.log(`   WNEX balance: ${hre.ethers.formatEther(wnexBalance)}`);
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    console.log("\n5. CHECKING TOKEN DECIMALS:");
    try {
        const nexaDecimals = await nexa.decimals();
        const nexbDecimals = await nexb.decimals();
        const wnexDecimals = await wnex.decimals();

        console.log(`   NEXA: ${nexaDecimals} decimals`);
        console.log(`   NEXB: ${nexbDecimals} decimals`);
        console.log(`   WNEX: ${wnexDecimals} decimals`);
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ TEST COMPLETE");
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ TEST FAILED:", error);
        process.exit(1);
    });
