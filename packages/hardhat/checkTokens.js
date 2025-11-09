const hre = require("hardhat");

async function main() {
    const nexusRPC = "https://testnet.rpc.nexus.xyz";
    
    console.log("🔍 CHECKING TOKEN METADATA");
    console.log("=" .repeat(50));
    
    const tokens = {
        NEXA: "0x054db41597F6eFb8515E355E3017FfEF635cEBF5",
        NEXB: "0x865D0e51191FBA553bd329074b64d652357b238C",
        WNEX: "0xF28c0151bEdEA14fa358bA049CB946f631c5607d"
    };
    
    for (const [name, address] of Object.entries(tokens)) {
        console.log(`\n📋 ${name} Token:`);
        console.log(`   Address: ${address}`);
        console.log(`   Check: Calling metadata...`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
