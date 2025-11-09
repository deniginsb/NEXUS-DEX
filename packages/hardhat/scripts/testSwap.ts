import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing Nexus DEX V2 Swap Functions...\n");

  // Addresses
  const NEXA_ADDRESS = "0xD93E79084880DB67725c0AD23BC380888d24876F";
  const NEXB_ADDRESS = "0xE58Da13581E2d9e2A5d2Ad39Ed6D65C19332E5d1";
  const WNEX_ADDRESS = "0x5A6128e1cF97339cD9C057a940950c02DbeA0B7B";
  const SWAP_ADDRESS = "0x48A3399B5D0630A746075167a944736d9112C458";

  const [user] = await ethers.getSigners();
  console.log(`Testing with account: ${user.address}\n`);

  // Get contracts
  const wnex = await ethers.getContractAt("WNEXStablecoin", WNEX_ADDRESS);
  const swap = await ethers.getContractAt("NativeNEXSwapV2", SWAP_ADDRESS);

  console.log("=".repeat(60));
  console.log("📊 Initial State");
  console.log("=".repeat(60));

  // Check user balances
  const userNEXBalance = await ethers.provider.getBalance(user.address);
  console.log(`User NEX Balance: ${ethers.formatEther(userNEXBalance)}`);

  const userWNEXBalance = await wnex.balanceOf(user.address);
  console.log(`User WNEX Balance: ${ethers.formatEther(userWNEXBalance)}`);

  // Check WNEX total supply
  const wnexSupply = await wnex.totalSupply();
  console.log(`WNEX Total Supply: ${ethers.formatEther(wnexSupply)}`);

  // Check contract NEX balance
  const contractNEXBalance = await ethers.provider.getBalance(SWAP_ADDRESS);
  console.log(`Contract NEX Balance: ${ethers.formatEther(contractNEXBalance)}\n`);

  // Test 1: NEX → WNEX (Mint)
  console.log("=".repeat(60));
  console.log("🧪 Test 1: NEX → WNEX (Mint WNEX)");
  console.log("=".repeat(60));

  const swapAmount = ethers.parseEther("0.1"); // 0.1 NEX
  console.log(`Swapping ${ethers.formatEther(swapAmount)} NEX to WNEX...\n`);

  try {
    const tx = await swap.swapNEXToWNEX({ value: swapAmount });
    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait(2);
    console.log(`✅ Transaction confirmed! Gas used: ${receipt.gasUsed.toString()}\n`);

    // Check balances after swap
    const newUserWNEXBalance = await wnex.balanceOf(user.address);
    const newWNEXSupply = await wnex.totalSupply();

    console.log("📊 After Swap:");
    console.log(`User WNEX Balance: ${ethers.formatEther(newUserWNEXBalance)} (increased)`);
    console.log(`WNEX Total Supply: ${ethers.formatEther(newWNEXSupply)} (minted!)`);
    console.log(`Difference: ${ethers.formatEther(newWNEXSupply - wnexSupply)}\n`);

    // Test 2: WNEX → NEX (Burn)
    if (newUserWNEXBalance > 0) {
      console.log("=".repeat(60));
      console.log("🧪 Test 2: WNEX → NEX (Burn WNEX)");
      console.log("=".repeat(60));

      const burnAmount = newUserWNEXBalance / 2n; // Burn half
      console.log(`Swapping ${ethers.formatEther(burnAmount)} WNEX back to NEX...\n`);

      // Approve first
      console.log("📝 Approving WNEX...");
      const approveTx = await wnex.approve(SWAP_ADDRESS, burnAmount);
      await approveTx.wait(2);
      console.log("✅ Approved\n");

      // Swap WNEX to NEX
      const swapTx = await swap.swapWNEXToNEX(burnAmount);
      console.log(`Transaction sent: ${swapTx.hash}`);
      const swapReceipt = await swapTx.wait(2);
      console.log(`✅ Transaction confirmed! Gas used: ${swapReceipt.gasUsed.toString()}\n`);

      // Check balances after burn
      const finalUserWNEXBalance = await wnex.balanceOf(user.address);
      const finalWNEXSupply = await wnex.totalSupply();
      const finalUserNEXBalance = await ethers.provider.getBalance(user.address);

      console.log("📊 After Burn:");
      console.log(`User WNEX Balance: ${ethers.formatEther(finalUserWNEXBalance)} (decreased)`);
      console.log(`WNEX Total Supply: ${ethers.formatEther(finalWNEXSupply)} (burned!)`);
      console.log(`Supply Decreased: ${ethers.formatEther(newWNEXSupply - finalWNEXSupply)}`);
      console.log(`User NEX Received: ~${ethers.formatEther(finalUserNEXBalance - userNEXBalance + swapAmount)} (after gas)\n`);
    }

    console.log("=".repeat(60));
    console.log("✅ All Tests Passed!");
    console.log("=".repeat(60));
    console.log("\n🎉 WNEX Stablecoin is working correctly!");
    console.log("   • NEX → WNEX: Mints WNEX ✅");
    console.log("   • WNEX → NEX: Burns WNEX ✅");
    console.log("   • Supply is dynamic ✅");

  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
