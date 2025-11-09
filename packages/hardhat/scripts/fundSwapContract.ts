import { ethers } from "hardhat";

async function main() {
  console.log("💰 Funding swap contract with tokens and NEX...\n");

  // Addresses from latest deployment
  const NEXA_ADDRESS = "0xD93E79084880DB67725c0AD23BC380888d24876F";
  const NEXB_ADDRESS = "0xE58Da13581E2d9e2A5d2Ad39Ed6D65C19332E5d1";
  const WNEX_ADDRESS = "0x5A6128e1cF97339cD9C057a940950c02DbeA0B7B";
  const SWAP_ADDRESS = "0x48A3399B5D0630A746075167a944736d9112C458";

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}\n`);

  // Get contracts
  const nexa = await ethers.getContractAt("NEXA", NEXA_ADDRESS);
  const nexb = await ethers.getContractAt("NEXB", NEXB_ADDRESS);
  const wnex = await ethers.getContractAt("WNEXStablecoin", WNEX_ADDRESS);
  const swap = await ethers.getContractAt("NativeNEXSwapV2", SWAP_ADDRESS);

  // Check current balances
  const nexaBalance = await nexa.balanceOf(SWAP_ADDRESS);
  console.log(`Current NEXA balance in swap: ${ethers.formatUnits(nexaBalance, 6)}`);

  const nexbBalance = await nexb.balanceOf(SWAP_ADDRESS);
  console.log(`Current NEXB balance in swap: ${ethers.formatUnits(nexbBalance, 6)}`);

  const nexBalance = await ethers.provider.getBalance(SWAP_ADDRESS);
  console.log(`Current NEX balance in swap: ${ethers.formatEther(nexBalance)}\n`);

  // Transfer 500,000 NEXB if needed (NEXA already transferred)
  if (nexbBalance < ethers.parseUnits("500000", 6)) {
    console.log("📤 Transferring 500,000 NEXB to swap contract...");
    const transferNEXBTx = await nexb.transfer(
      SWAP_ADDRESS,
      ethers.parseUnits("500000", 6)
    );
    await transferNEXBTx.wait(2);
    console.log("✅ Transferred 500,000 NEXB\n");
  } else {
    console.log("✅ NEXB already funded\n");
  }

  // Send 10 NEX to swap contract if needed
  if (nexBalance < ethers.parseEther("10")) {
    console.log("📤 Sending 10 NEX to swap contract...");
    const fundNEXTx = await deployer.sendTransaction({
      to: SWAP_ADDRESS,
      value: ethers.parseEther("10")
    });
    await fundNEXTx.wait(2);
    console.log("✅ Sent 10 NEX\n");
  } else {
    console.log("✅ NEX already funded\n");
  }

  // Check if swap contract is authorized minter
  const isMinter = await wnex.isMinter(SWAP_ADDRESS);
  if (!isMinter) {
    console.log("🔧 Adding swap contract as WNEX minter...");
    const addMinterTx = await wnex.addMinter(SWAP_ADDRESS);
    await addMinterTx.wait(2);
    console.log("✅ Swap contract added as minter\n");
  } else {
    console.log("✅ Swap contract already authorized as minter\n");
  }

  // Final balances
  console.log("=".repeat(60));
  console.log("📊 Final Contract Balances:");
  console.log("=".repeat(60));
  
  const finalNexaBalance = await nexa.balanceOf(SWAP_ADDRESS);
  console.log(`NEXA: ${ethers.formatUnits(finalNexaBalance, 6)}`);

  const finalNexbBalance = await nexb.balanceOf(SWAP_ADDRESS);
  console.log(`NEXB: ${ethers.formatUnits(finalNexbBalance, 6)}`);

  const finalNexBalance = await ethers.provider.getBalance(SWAP_ADDRESS);
  console.log(`NEX:  ${ethers.formatEther(finalNexBalance)}`);

  const wnexSupply = await wnex.totalSupply();
  console.log(`WNEX Supply: ${ethers.formatEther(wnexSupply)} (minted on demand)\n`);

  console.log("✅ Swap contract is ready for testing!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
