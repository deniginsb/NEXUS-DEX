const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NEXWNEXPool", function () {
  let pool, wnex, owner, user;
  
  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    
    // Deploy WNEX
    const WNEXStablecoin = await ethers.getContractFactory("WNEXStablecoin");
    wnex = await WNEXStablecoin.deploy(owner.address);
    await wnex.waitForDeployment();
    
    console.log("WNEX deployed to:", await wnex.getAddress());
    
    // Deploy Pool
    const NEXWNEXPool = await ethers.getContractFactory("NEXWNEXPool");
    pool = await NEXWNEXPool.deploy(await wnex.getAddress(), owner.address);
    await pool.waitForDeployment();
    
    console.log("Pool deployed to:", await pool.getAddress());
    
    // Mint some WNEX to user for testing
    await wnex.connect(owner).mint(user.address, ethers.parseEther("100"));
    
    console.log("User WNEX balance:", ethers.formatEther(await wnex.balanceOf(user.address)));
  });
  
  it("Should add liquidity successfully", async function () {
    const amount = ethers.parseEther("1");
    
    console.log("\n=== Testing Add Liquidity ===");
    console.log("Amount: 1 NEX + 1 WNEX");
    
    // Approve WNEX
    console.log("\n1. Approving WNEX...");
    const approveTx = await wnex.connect(user).approve(await pool.getAddress(), amount);
    await approveTx.wait();
    
    const allowance = await wnex.allowance(user.address, await pool.getAddress());
    console.log("   Allowance after approve:", ethers.formatEther(allowance));
    
    // Add liquidity
    console.log("\n2. Adding liquidity...");
    try {
      const addTx = await pool.connect(user).addLiquidity(amount, { value: amount });
      const receipt = await addTx.wait();
      
      console.log("   ✅ SUCCESS! Gas used:", receipt.gasUsed.toString());
      
      // Check LP balance
      const lpBalance = await pool.balanceOf(user.address);
      console.log("   LP tokens received:", ethers.formatEther(lpBalance));
      
      // Check reserves
      const reserves = await pool.getReserves();
      console.log("   Pool reserves:");
      console.log("     NEX:", ethers.formatEther(reserves[0]));
      console.log("     WNEX:", ethers.formatEther(reserves[1]));
      
      expect(lpBalance).to.be.gt(0);
      
    } catch (error) {
      console.error("\n   ❌ FAILED!");
      console.error("   Error:", error.message);
      if (error.data) {
        console.error("   Data:", error.data);
      }
      throw error;
    }
  });
  
  it("Should check WNEX_TOKEN address", async function () {
    const wnexFromPool = await pool.WNEX_TOKEN();
    const wnexActual = await wnex.getAddress();
    
    console.log("\n=== Checking Addresses ===");
    console.log("WNEX_TOKEN from pool:", wnexFromPool);
    console.log("Actual WNEX address: ", wnexActual);
    
    expect(wnexFromPool).to.equal(wnexActual);
  });
});
