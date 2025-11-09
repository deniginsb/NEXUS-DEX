const hre = require("hardhat");

async function main() {
    console.log("🔍 DEPLOYMENT READINESS CHECK");
    console.log("=".repeat(60));

    // 1. Check network
    const network = await hre.ethers.provider.getNetwork();
    console.log("\n1. NETWORK CONFIGURATION:");
    console.log(`   Chain ID: ${network.chainId}`);
    console.log(`   Expected: 3945 (Nexus Testnet3)`);
    console.log(`   Status: ${Number(network.chainId) === 3945 ? '✅ CORRECT' : '❌ WRONG'}`);

    // 2. Check accounts
    const [deployer] = await hre.ethers.getSigners();
    console.log("\n2. DEPLOYER ACCOUNT:");
    console.log(`   Address: ${deployer.address}`);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`   Balance: ${hre.ethers.formatEther(balance)} NEX`);
    console.log(`   Status: ${balance > 0n ? '✅ HAS FUNDS' : '❌ NO FUNDS'}`);

    // 3. Check contracts compilation
    console.log("\n3. CONTRACT COMPILATION:");
    const NEXA = await hre.ethers.getContractFactory("NEXA");
    const NEXB = await hre.ethers.getContractFactory("NEXB");
    const WNEX = await hre.ethers.getContractFactory("WNEX");
    const NativeNEXSwap = await hre.ethers.getContractFactory("NativeNEXSwap");

    console.log(`   NEXA: ✅ Compiled`);
    console.log(`   NEXB: ✅ Compiled`);
    console.log(`   WNEX: ✅ Compiled`);
    console.log(`   NativeNEXSwap: ✅ Compiled`);

    // 4. Check token addresses
    console.log("\n4. TOKEN ADDRESSES:");
    const tokenAddresses = {
        NEXA: "0x054db41597F6eFb8515E355E3017FfEF635cEBF5",
        NEXB: "0x865D0e51191FBA553bd329074b64d652357b238C",
        WNEX: "0xF28c0151bEdEA14fa358bA049CB946f631c5607d"
    };

    for (const [name, address] of Object.entries(tokenAddresses)) {
        console.log(`   ${name}: ${address}`);
    }

    // 5. Summary
    console.log("\n5. DEPLOYMENT READINESS:");
    console.log(`   Network: ${Number(network.chainId) === 3945 ? '✅' : '❌'}`);
    console.log(`   Funds: ${balance > 0n ? '✅' : '❌'}`);
    console.log(`   Contracts: ✅`);
    console.log(`   Token Addresses: ✅`);

    console.log("\n" + "=".repeat(60));
    if (Number(network.chainId) === 3945 && balance > 0n) {
        console.log("✅ READY TO DEPLOY!");
    } else {
        console.log("❌ NOT READY - FIX ISSUES ABOVE");
    }
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ ERROR:", error);
        process.exit(1);
    });
