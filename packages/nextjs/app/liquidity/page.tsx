"use client";

import { ArrowLeftIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { TokenRegistry } from "~~/utils/tokenRegistry";
import { TokenInfo } from "~~/utils/types";

// NEXWNEXPool ABI for liquidity pool
const POOL_ABI = [
  {
    type: "function",
    name: "addLiquidity",
    stateMutability: "payable",
    inputs: [{ name: "wnexAmount", type: "uint256" }],
    outputs: [{ name: "lpTokens", type: "uint256" }],
  },
  {
    type: "function",
    name: "removeLiquidity",
    stateMutability: "nonpayable",
    inputs: [{ name: "lpTokens", type: "uint256" }],
    outputs: [
      { name: "nexAmount", type: "uint256" },
      { name: "wnexAmount", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "getReserves",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "_reserveNEX", type: "uint256" },
      { name: "_reserveWNEX", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "calculateLPTokens",
    stateMutability: "view",
    inputs: [
      { name: "nexAmount", type: "uint256" },
      { name: "wnexAmount", type: "uint256" },
    ],
    outputs: [{ name: "lpTokens", type: "uint256" }],
  },
  {
    type: "function",
    name: "calculateWithdrawal",
    stateMutability: "view",
    inputs: [{ name: "lpTokens", type: "uint256" }],
    outputs: [
      { name: "nexAmount", type: "uint256" },
      { name: "wnexAmount", type: "uint256" },
    ],
  },
] as const;

const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

const LiquidityPage = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  // Fixed pair: NEX and WNEX only!
  const [nexToken] = useState<TokenInfo>({
    address: "native",
    symbol: "NEX",
    name: "Nexus Token",
    decimals: 18,
    isNative: true,
    chainId: 3945,
  });
  const [wnexToken] = useState<TokenInfo>({
    address: "0x5A6128e1cF97339cD9C057a940950c02DbeA0B7B",
    symbol: "WNEX",
    name: "Wrapped NEX Stablecoin",
    decimals: 18,
    isNative: false,
    chainId: 3945,
  });
  
  const [nexAmount, setNexAmount] = useState("");
  const [wnexAmount, setWnexAmount] = useState("");
  const [lpAmount, setLpAmount] = useState("");
  const [nexBalance, setNexBalance] = useState<string>("0");
  const [wnexBalance, setWnexBalance] = useState<string>("0");
  const [lpBalance, setLpBalance] = useState<string>("0");
  const [poolReserves, setPoolReserves] = useState({ nex: "0", wnex: "0" });
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const balanceUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const POOL_ADDRESS = "0x060d6D97cbBd33D3658aBe4C4A86bBb25a1E6653";

  // Debounced balance update function
  const updateBalances = useCallback(async (force = false) => {
    if (!connectedAddress) {
      setNexBalance("0");
      setWnexBalance("0");
      setLpBalance("0");
      return;
    }

    // Prevent excessive updates - increased to 5 seconds
    const now = Date.now();
    if (!force && now - lastUpdate < 5000) {
      console.log("⏱️ Skipping balance update - too soon");
      return;
    }

    console.log("💰 Updating liquidity balances for:", connectedAddress);
    setLastUpdate(now);

    try {
      // Fetch balances and pool reserves
      const [nexResult, wnexResult, lpResult, reservesResult] = await Promise.allSettled([
        TokenRegistry.getTokenBalance(nexToken, connectedAddress),
        TokenRegistry.getTokenBalance(wnexToken, connectedAddress),
        fetch("https://testnet.rpc.nexus.xyz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [{
              to: POOL_ADDRESS,
              data: "0x70a08231" + connectedAddress.slice(2).padStart(64, "0"), // balanceOf
            }, "latest"],
            id: Math.floor(Math.random() * 1000000),
          }),
        }).then(r => r.json()).then(d => {
          const balance = BigInt(d.result || "0");
          return (Number(balance) / 1e18).toFixed(4);
        }),
        fetch("https://testnet.rpc.nexus.xyz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [{ to: POOL_ADDRESS, data: "0x0902f1ac" }, "latest"], // getReserves
            id: Math.floor(Math.random() * 1000000),
          }),
        }).then(r => r.json()).then(d => {
          if (d.result && d.result !== "0x") {
            const hex = d.result.slice(2);
            const nex = BigInt("0x" + hex.slice(0, 64));
            const wnex = BigInt("0x" + hex.slice(64, 128));
            return {
              nex: (Number(nex) / 1e18).toFixed(2),
              wnex: (Number(wnex) / 1e18).toFixed(2),
            };
          }
          return { nex: "0", wnex: "0" };
        }),
      ]);

      if (nexResult.status === "fulfilled") {
        setNexBalance(nexResult.value);
        console.log(`✅ NEX balance: ${nexResult.value}`);
      }

      if (wnexResult.status === "fulfilled") {
        setWnexBalance(wnexResult.value);
        console.log(`✅ WNEX balance: ${wnexResult.value}`);
      }

      if (lpResult.status === "fulfilled") {
        setLpBalance(lpResult.value);
        console.log(`✅ LP balance: ${lpResult.value}`);
      } else {
        console.error("❌ Failed to fetch LP balance:", lpResult.reason);
        setLpBalance("0.0000");
      }

      if (reservesResult.status === "fulfilled") {
        setPoolReserves(reservesResult.value);
        console.log(`✅ Pool reserves: ${reservesResult.value.nex} NEX, ${reservesResult.value.wnex} WNEX`);
      } else {
        console.error("❌ Failed to fetch pool reserves:", reservesResult.reason);
        setPoolReserves({ nex: "0", wnex: "0" });
      }
    } catch (error) {
      console.error("❌ Error updating balances:", error);
    }
  }, [connectedAddress, nexToken, wnexToken, lastUpdate, POOL_ADDRESS]);

  // Debounced update on dependency change
  useEffect(() => {
    if (balanceUpdateTimeout.current) {
      clearTimeout(balanceUpdateTimeout.current);
    }

    balanceUpdateTimeout.current = setTimeout(() => {
      updateBalances();
    }, 2000); // Increased to 2 seconds

    return () => {
      if (balanceUpdateTimeout.current) {
        clearTimeout(balanceUpdateTimeout.current);
      }
    };
  }, [connectedAddress, updateBalances]);

  // Auto-calculate WNEX amount (1:1 with NEX for liquidity pool)
  useEffect(() => {
    if (nexAmount && !isNaN(Number(nexAmount))) {
      setWnexAmount(nexAmount); // Always 1:1 ratio
    } else {
      setWnexAmount("");
    }
  }, [nexAmount]);

  const handleAddLiquidity = async () => {
    if (!nexAmount || !wnexAmount || !connectedAddress) {
      toast.error("Please enter amounts");
      return;
    }

    if (nexAmount !== wnexAmount) {
      toast.error("Amounts must be equal (1:1 ratio)");
      return;
    }

    setIsProcessing(true);

    try {
      const nexAmountWei = BigInt(Math.floor(Number(nexAmount) * 1e18));
      const wnexAmountWei = BigInt(Math.floor(Number(wnexAmount) * 1e18));

      console.log("💰 Adding liquidity to NEX-WNEX pool...");
      console.log(`   NEX: ${nexAmount}, WNEX: ${wnexAmount}`);

      // Step 1: Approve WNEX
      toast.loading("Step 1/2: Approving WNEX...", { id: "add-liquidity" });
      
      try {
        const approveHash = await writeContractAsync({
          address: wnexToken.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [POOL_ADDRESS, wnexAmountWei],
        });

        console.log("✅ Approval sent:", approveHash);
      } catch (approveError: any) {
        console.error("❌ Approval failed:", approveError);
        toast.error("Approval cancelled or failed", { id: "add-liquidity" });
        return;
      }
      
      // Wait a bit for blockchain to process (simple delay, no polling)
      toast.loading("Step 2/2: Adding liquidity...", { id: "add-liquidity" });
      await new Promise(resolve => setTimeout(resolve, 3000));

      const txHash = await writeContractAsync({
        address: POOL_ADDRESS as `0x${string}`,
        abi: POOL_ABI,
        functionName: "addLiquidity",
        args: [wnexAmountWei],
        value: nexAmountWei,
      });

      console.log("✅ Transaction sent:", txHash);

      // Show success immediately (blockchain will handle it)
      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-bold">Liquidity Added! 🎉</div>
          <div className="text-sm">
            Adding {nexAmount} NEX + {wnexAmount} WNEX to pool
          </div>
          <a 
            href={`https://nexus.testnet.blockscout.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            View on Explorer →
          </a>
        </div>,
        { id: "add-liquidity", duration: 5000 }
      );

      // Update balances after blockchain confirmation
      setTimeout(() => {
        updateBalances(true);
      }, 5000);

      setNexAmount("");
      setWnexAmount("");

    } catch (error: any) {
      console.error("❌ Add liquidity failed:", error);
      toast.error(`Failed: ${error.shortMessage || error.message || "Unknown error"}`, { id: "add-liquidity" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!lpAmount || !connectedAddress) {
      toast.error("Please enter LP token amount to remove");
      return;
    }

    setIsProcessing(true);

    try {
      const lpAmountWei = BigInt(Math.floor(Number(lpAmount) * 1e18));

      console.log("💰 Removing liquidity from NEX-WNEX pool...");
      console.log(`   LP Tokens: ${lpAmount}`);

      toast.loading("Removing liquidity...", { id: "remove-liquidity" });

      const tx = await writeContractAsync({
        address: POOL_ADDRESS as `0x${string}`,
        abi: POOL_ABI,
        functionName: "removeLiquidity",
        args: [lpAmountWei],
      });

      console.log("✅ Transaction sent:", tx);

      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-bold">Liquidity Removed! 🔥</div>
          <div className="text-sm">
            Burned {lpAmount} LP tokens
          </div>
          <a 
            href={`https://nexus.testnet.blockscout.com/tx/${tx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            View on Explorer →
          </a>
        </div>,
        { id: "remove-liquidity", duration: 5000 }
      );

      // Update balances after blockchain confirmation
      setTimeout(() => {
        updateBalances(true);
      }, 5000);

      setLpAmount("");

    } catch (error: any) {
      console.error("❌ Remove liquidity failed:", error);
      toast.error(`Failed: ${error.shortMessage || error.message || "Unknown error"}`, { id: "remove-liquidity" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-xl">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost normal-case text-xl">
            <ArrowLeftIcon className="h-6 w-6" />
            Nexus DEX
          </Link>
        </div>
      </div>

      <div className="flex justify-center items-center py-20">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-3xl justify-center mb-2">NEX + WNEX Pool</h2>
            <p className="text-center text-sm text-gray-500 mb-4">
              Add liquidity to earn fees from trades
            </p>

            {/* Pool Stats */}
            <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-4">
              <div className="stat">
                <div className="stat-title text-xs">Pool TVL</div>
                <div className="stat-value text-lg">{poolReserves.nex} NEX</div>
                <div className="stat-desc">{poolReserves.wnex} WNEX</div>
              </div>
              <div className="stat">
                <div className="stat-title text-xs">Your LP</div>
                <div className="stat-value text-lg">{lpBalance}</div>
                <div className="stat-desc">LP Tokens</div>
              </div>
            </div>

            {!connectedAddress ? (
              <div className="alert alert-warning">
                <span>Please connect your wallet to provide liquidity</span>
              </div>
            ) : (
              <>
                {/* ADD LIQUIDITY SECTION */}
                <div className="bg-base-200 rounded-lg p-4 mb-4">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <PlusIcon className="h-5 w-5" />
                    Add Liquidity (NEX → WNEX)
                  </h3>
                  
                  {/* NEX Input */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold">NEX Amount</span>
                      <div className="flex items-center gap-2">
                        <span className="label-text-alt">Balance: {nexBalance}</span>
                        <button
                          onClick={() => updateBalances(true)}
                          className="btn btn-ghost btn-xs"
                          title="Refresh balance"
                        >
                          🔄
                        </button>
                      </div>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="0.0"
                        className="input input-bordered w-full"
                        value={nexAmount}
                        onChange={(e) => setNexAmount(e.target.value)}
                        disabled={isProcessing}
                      />
                      <button
                        className="btn btn-outline"
                        onClick={() => setNexAmount(nexBalance)}
                        disabled={isProcessing}
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  {/* WNEX Output (read-only) */}
                  <div className="flex justify-center my-2">
                    <div className="text-2xl">↓</div>
                  </div>

                  <div className="alert alert-info mt-2">
                    <div className="text-sm">
                      <p>Deposit equal amounts of NEX + WNEX</p>
                      <p className="text-xs mt-1">You&apos;ll receive LP tokens representing your share</p>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary btn-lg w-full mt-4" 
                    onClick={handleAddLiquidity}
                    disabled={!connectedAddress || !nexAmount || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-5 w-5" />
                        Add Liquidity
                      </>
                    )}
                  </button>
                </div>

                {/* REMOVE LIQUIDITY SECTION */}
                <div className="bg-base-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <MinusIcon className="h-5 w-5" />
                    Remove Liquidity
                  </h3>

                  {/* LP Token Input */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold">LP Tokens</span>
                      <div className="flex items-center gap-2">
                        <span className="label-text-alt">Balance: {lpBalance}</span>
                        <button
                          onClick={() => updateBalances(true)}
                          className="btn btn-ghost btn-xs"
                          title="Refresh balance"
                        >
                          🔄
                        </button>
                      </div>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="0.0"
                        className="input input-bordered w-full"
                        value={lpAmount}
                        onChange={(e) => setLpAmount(e.target.value)}
                        disabled={isProcessing}
                      />
                      <button
                        className="btn btn-outline"
                        onClick={() => setLpAmount(lpBalance)}
                        disabled={isProcessing}
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  {/* Output info */}
                  <div className="alert alert-info mt-4">
                    <div className="text-sm">
                      <p>You will receive proportional NEX + WNEX</p>
                      <p className="text-xs mt-1">Fee: 3% on withdrawal</p>
                    </div>
                  </div>

                  <button 
                    className="btn btn-secondary btn-lg w-full mt-4" 
                    onClick={handleRemoveLiquidity}
                    disabled={!connectedAddress || !lpAmount || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <MinusIcon className="h-5 w-5" />
                        Remove Liquidity
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            <div className="divider">YOUR POSITIONS</div>
            <div className="text-center text-gray-500 py-8">
              <p>No liquidity positions yet</p>
              <p className="text-sm">Add liquidity to earn trading fees</p>
            </div>

            <div className="divider">INFO</div>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Earn 0.3% fee on all trades</p>
              <p>• Gas Fees: NEX</p>
              <p>• Powered by Nexus Layer 1</p>
              <p>• Network: Nexus Testnet3 (Chain ID: 3945)</p>
              <p>• Custom tokens are stored locally in your browser</p>
              <p>• Token balances are fetched from your wallet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityPage;