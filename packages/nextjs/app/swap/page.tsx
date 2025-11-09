"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useAccount, useWriteContract } from "wagmi";
import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { TokenRegistry } from "~~/utils/tokenRegistry";
import { TokenInfo } from "~~/utils/types";

// ERC20 ABI (minimal)
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

// NativeNEXSwapV2 ABI (with WNEX->NEX swap)
const NATIVE_NEX_SWAP_ABI = [
  {
    type: "function",
    name: "swapNEXToNEXA",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "swapNEXToNEXB",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "swapNEXToWNEX",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "swapWNEXToNEX",
    stateMutability: "nonpayable",
    inputs: [{ name: "wnexAmount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "swapTokens",
    stateMutability: "nonpayable",
    inputs: [
      { name: "fromToken", type: "address" },
      { name: "toToken", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

// StablecoinSwap ABI (for BTC, ETH, SOL, etc)
const STABLECOIN_SWAP_ABI = [
  {
    type: "function",
    name: "swapNEXForToken",
    stateMutability: "payable",
    inputs: [{ name: "tokenAddress", type: "address" }],
    outputs: [],
  },
  {
    type: "function",
    name: "swapTokenForNEX",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenAddress", type: "address" },
      { name: "tokenAmount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

const STABLECOIN_SWAP_ADDRESS = "0x51253E3Cf94CBcABA852EbC2C2c420e687FEeC99";

// Stablecoin tokens (use StablecoinSwap contract)
const STABLECOIN_TOKENS = [
  "BTC", "ETH", "SOL", "ADA", "MATIC", "LINK", "AVAX", "UNI", 
  "DOGE", "SHIB", "LTC", "BNB", "USDT", "XRP", "DOT", "USDC",
  "ATOM", "ALGO", "NEAR", "FTM", "AAVE", "SAND"
];

// Legacy TokenSwap ABI (deprecated)
const TOKEN_SWAP_ABI = [
  {
    type: "function",
    name: "swap",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
] as const;

const SwapPage = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [fromToken, setFromToken] = useState<TokenInfo | null>(null);
  const [toToken, setToToken] = useState<TokenInfo | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [availableTokens, setAvailableTokens] = useState<TokenInfo[]>([]);
  const [fromBalance, setFromBalance] = useState<string>("0");
  const [toBalance, setToBalance] = useState<string>("0");
  const [isSwapping, setIsSwapping] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const balanceUpdateTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounced balance update function
  const updateBalances = useCallback(async (force = false) => {
    if (!connectedAddress) {
      setFromBalance("0");
      setToBalance("0");
      return;
    }

    // Prevent excessive updates - only update if forced or after 2 seconds
    const now = Date.now();
    if (!force && now - lastUpdate < 2000) {
      console.log("⏱️ Skipping balance update - too soon");
      return;
    }

    console.log("💰 Updating balances for:", connectedAddress);
    setLastUpdate(now);

    try {
      // Fetch balances concurrently
      const balancePromises = [];
      if (fromToken) {
        balancePromises.push(
          TokenRegistry.getTokenBalance(fromToken, connectedAddress).then(balance => ({ token: 'from', balance }))
        );
      }
      if (toToken) {
        balancePromises.push(
          TokenRegistry.getTokenBalance(toToken, connectedAddress).then(balance => ({ token: 'to', balance }))
        );
      }

      const results = await Promise.allSettled(balancePromises);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { token, balance } = result.value;
          if (token === 'from') {
            setFromBalance(balance);
            console.log(`✅ Updated from balance: ${balance} ${fromToken?.symbol}`);
          } else {
            setToBalance(balance);
            console.log(`✅ Updated to balance: ${balance} ${toToken?.symbol}`);
          }
        } else {
          console.error(`❌ Failed to update ${index === 0 ? 'from' : 'to'} balance:`, result.reason);
        }
      });
    } catch (error) {
      console.error("❌ Error updating balances:", error);
    }
  }, [connectedAddress, fromToken, toToken, lastUpdate]);

  // Debounced update on dependency change
  useEffect(() => {
    // Clear existing timeout
    if (balanceUpdateTimeout.current) {
      clearTimeout(balanceUpdateTimeout.current);
    }

    // Set new timeout for debounced update
    balanceUpdateTimeout.current = setTimeout(() => {
      updateBalances();
    }, 1000); // Wait 1 second before updating

    // Cleanup on unmount
    return () => {
      if (balanceUpdateTimeout.current) {
        clearTimeout(balanceUpdateTimeout.current);
      }
    };
  }, [connectedAddress, fromToken, toToken, updateBalances]);

  useEffect(() => {
    setAvailableTokens(TokenRegistry.getAllTokens());
    // Set default tokens
    if (!fromToken) {
      setFromToken(TokenRegistry.findTokenBySymbol("NEXA") || null);
    }
    if (!toToken) {
      setToToken(TokenRegistry.findTokenBySymbol("NEXB") || null);
    }
  }, [fromToken, toToken]);

  // Calculate toAmount when fromAmount, fromToken, or toToken changes
  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      const calculatedAmount = TokenRegistry.calculateSwapRate(fromToken, toToken, fromAmount);
      setToAmount(calculatedAmount);
    } else {
      setToAmount("");
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwap = async () => {
    if (!fromAmount || !fromToken || !toToken || !connectedAddress) {
      toast.error("Missing required information for swap");
      return;
    }

    setIsSwapping(true);

    try {
      // NativeNEXSwapV2 contract address - deployed on Nexus Testnet3
      const nativeSwapAddress = "0x48A3399B5D0630A746075167a944736d9112C458";

      // Parse amount (handle decimal conversion)
      const amount = BigInt(Math.floor(Number(fromAmount) * Math.pow(10, fromToken.decimals)));

      console.log("🔄 Starting swap process...");
      console.log(`   From: ${fromAmount} ${fromToken.symbol} (${amount} wei)`);
      console.log(`   To: ${toToken.symbol}`);
      console.log(`   NativeNEXSwap contract: ${nativeSwapAddress}`);

    // ============= STABLECOIN SWAP LOGIC =============
    // Determine which contract to use
    const isFromStablecoin = STABLECOIN_TOKENS.includes(fromToken.symbol);
    const isToStablecoin = STABLECOIN_TOKENS.includes(toToken.symbol);
    const isFromNEX = fromToken.isNative;
    const isToNEX = toToken.isNative;

    console.log(`💱 Swap: ${fromToken.symbol} -> ${toToken.symbol}`);
    console.log(`   From Stablecoin: ${isFromStablecoin}, To Stablecoin: ${isToStablecoin}`);
    console.log(`   From NEX: ${isFromNEX}, To NEX: ${isToNEX}`);

    // Use StablecoinSwap for: NEX <-> Stablecoin
    if ((isFromNEX && isToStablecoin) || (isFromStablecoin && isToNEX)) {
      console.log("📝 Using StablecoinSwap contract");
      
      if (isFromNEX && isToStablecoin) {
        // NEX -> Stablecoin
        console.log(`   NEX -> ${toToken.symbol}: ${fromAmount} NEX`);
        
        const hash = await writeContractAsync({
          address: STABLECOIN_SWAP_ADDRESS as `0x${string}`,
          abi: STABLECOIN_SWAP_ABI,
          functionName: "swapNEXForToken",
          args: [toToken.address as `0x${string}`],
          value: amount,
        });

        console.log("✅ Transaction sent:", hash);
        toast.success(
          <div>
            <p className="font-bold">Swap Successful!</p>
            <p className="text-sm">
              {fromAmount} {fromToken.symbol} → {toAmount} {toToken.symbol}
            </p>
            <a
              href={`https://nexus.testnet.blockscout.com/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline text-xs"
            >
              View on Explorer →
            </a>
          </div>,
        );

        setTimeout(() => updateBalances(true), 2000);
        setIsSwapping(false);
        return;
      } else {
        // Stablecoin -> NEX
        console.log(`   ${fromToken.symbol} -> NEX: ${fromAmount} ${fromToken.symbol}`);
        
        // First approve
        console.log("   1️⃣ Approving StablecoinSwap...");
        const approveHash = await writeContractAsync({
          address: fromToken.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [STABLECOIN_SWAP_ADDRESS as `0x${string}`, amount],
        });
        console.log("   ✅ Approved:", approveHash);
        
        // Then swap
        console.log("   2️⃣ Swapping...");
        const hash = await writeContractAsync({
          address: STABLECOIN_SWAP_ADDRESS as `0x${string}`,
          abi: STABLECOIN_SWAP_ABI,
          functionName: "swapTokenForNEX",
          args: [fromToken.address as `0x${string}`, amount],
        });

        console.log("✅ Transaction sent:", hash);
        toast.success(
          <div>
            <p className="font-bold">Swap Successful!</p>
            <p className="text-sm">
              {fromAmount} {fromToken.symbol} → {toAmount} {toToken.symbol}
            </p>
            <a
              href={`https://nexus.testnet.blockscout.com/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline text-xs"
            >
              View on Explorer →
            </a>
          </div>,
        );

        setTimeout(() => updateBalances(true), 2000);
        setIsSwapping(false);
        return;
      }
    }
    // ============= END STABLECOIN SWAP LOGIC =============


      // Check if swapping native NEX to any token
      if (fromToken.isNative) {
        console.log("✅ Native NEX swap detected!");

        // For NEXA, NEXB, WNEX use special functions
        if (toToken.symbol === "NEXA") {
          const swapHash = await writeContractAsync({
            address: nativeSwapAddress as `0x${string}`,
            abi: NATIVE_NEX_SWAP_ABI,
            functionName: "swapNEXToNEXA",
            args: [],
            value: amount,
          });
          toast.success(`Swap Successful! Check explorer`, { duration: 5000 });
          setTimeout(() => updateBalances(true), 2000);
          setIsSwapping(false);
          return;
        } else if (toToken.symbol === "NEXB") {
          const swapHash = await writeContractAsync({
            address: nativeSwapAddress as `0x${string}`,
            abi: NATIVE_NEX_SWAP_ABI,
            functionName: "swapNEXToNEXB",
            args: [],
            value: amount,
          });
          toast.success(`Swap Successful! Check explorer`, { duration: 5000 });
          setTimeout(() => updateBalances(true), 2000);
          setIsSwapping(false);
          return;
        } else if (toToken.symbol === "WNEX") {
          const swapHash = await writeContractAsync({
            address: nativeSwapAddress as `0x${string}`,
            abi: NATIVE_NEX_SWAP_ABI,
            functionName: "swapNEXToWNEX",
            args: [],
            value: amount,
          });
          toast.success(`Swap Successful! Check explorer`, { duration: 5000 });
          setTimeout(() => updateBalances(true), 2000);
          setIsSwapping(false);
          return;
        } else {
          // For other tokens, contract doesn't support yet
          toast.error(`Native NEX swap to ${toToken.symbol} not supported by contract. Please use WNEX first.`);
          setIsSwapping(false);
          return;
        }
      }

      // Check if swapping WNEX to NEX (BURN WNEX!)
      if (fromToken.symbol === "WNEX" && toToken.isNative) {
        console.log("🔥 WNEX -> NEX swap detected - will burn WNEX!");

        // Step 1: Approve NativeNEXSwapV2 to spend WNEX
        console.log("📝 Step 1: Approving WNEX...");
        const fromTokenAddress = fromToken.address as `0x${string}`;
        const approveHash = await writeContractAsync({
          address: fromTokenAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [nativeSwapAddress, amount],
        });

        console.log("✅ Approval transaction sent:", approveHash);
        toast.loading("Approval confirmed! Now burning WNEX...", { id: "wnex-burn" });

        // Step 2: Swap WNEX to NEX (burns WNEX)
        console.log("🔥 Step 2: Burning WNEX and receiving NEX...");
        const swapHash = await writeContractAsync({
          address: nativeSwapAddress as `0x${string}`,
          abi: NATIVE_NEX_SWAP_ABI,
          functionName: "swapWNEXToNEX",
          args: [amount],
        });

        console.log("✅ Swap transaction sent:", swapHash);
        
        // Dismiss loading toast and show success
        toast.success(
          <div className="flex flex-col gap-1">
            <div className="font-bold">WNEX Burned Successfully! 🔥</div>
            <div className="text-sm">
              WNEX supply decreased! You received NEX.
            </div>
            <a 
              href={`https://nexus.testnet.blockscout.com/tx/${swapHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              View on Explorer →
            </a>
          </div>,
          { id: "wnex-burn", duration: 5000 }
        );

        // Update balances
        setTimeout(() => {
          updateBalances(true);
        }, 2000);
        setFromAmount("");
        setToAmount("");
        setIsSwapping(false);
        return;
      }

      // ERC20 Token Swaps (WNEX to other tokens, or other tokens to WNEX/NEXA/NEXB)
      const fromTokenAddress = fromToken.address as `0x${string}`;
      const toTokenAddress = toToken.address as `0x${string}`;

      // Check if contract supports these tokens
      // Contract only supports: NEXA, NEXB, WNEX
      const supportedTokens = ["NEXA", "NEXB", "WNEX"];
      if (!supportedTokens.includes(fromToken.symbol) || !supportedTokens.includes(toToken.symbol)) {
        toast.error(`Swap ${fromToken.symbol} -> ${toToken.symbol} not supported. Contract only supports: NEXA, NEXB, WNEX`);
        setIsSwapping(false);
        return;
      }

      // Step 1: Approve NativeNEXSwap to spend fromToken
      console.log("📝 Step 1: Approving NativeNEXSwap contract...");
      toast.loading("Approving token spending...", { id: "erc20-swap" });
      
      const approveHash = await writeContractAsync({
        address: fromTokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [nativeSwapAddress, amount],
      });

      console.log("✅ Approval transaction sent:", approveHash);

      // Wait for approval to be confirmed
      toast.loading("Approval confirmed! Now swapping tokens...", { id: "erc20-swap" });

      // Step 2: Perform the ERC20 swap
      console.log("🔄 Step 2: Performing ERC20 swap...");
      const swapHash = await writeContractAsync({
        address: nativeSwapAddress as `0x${string}`,
        abi: NATIVE_NEX_SWAP_ABI,
        functionName: "swapTokens",
        args: [fromTokenAddress, toTokenAddress, amount],
      });

      console.log("✅ Swap transaction sent:", swapHash);
      
      // Success toast
      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-bold">Swap Successful! 🎉</div>
          <div className="text-sm">
            Your {toToken.symbol} tokens have been transferred.
          </div>
          <a 
            href={`https://nexus.testnet.blockscout.com/tx/${swapHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            View on Explorer →
          </a>
        </div>,
        { id: "erc20-swap", duration: 5000 }
      );

      // Update balances after successful swap
      setTimeout(() => {
        updateBalances(true); // Force update
      }, 2000);
      setFromAmount("");
      setToAmount("");

    } catch (error: any) {
      console.error("❌ Swap failed:", error);
      toast.error(`Swap failed: ${error.shortMessage || error.message || "Unknown error"}`);
    } finally {
      setIsSwapping(false);
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
            <h2 className="card-title text-3xl justify-center mb-6">Swap Tokens</h2>

            {!connectedAddress ? (
              <div className="alert alert-warning">
                <span>Please connect your wallet to start trading</span>
              </div>
            ) : (
              <>
                {/* From Token Selection */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">From</span>
                    <div className="flex items-center gap-2">
                      <span className="label-text-alt">Balance: {fromBalance} {fromToken?.symbol || "Select"}</span>
                      <button
                        onClick={() => updateBalances(true)}
                        className="btn btn-ghost btn-xs"
                        title="Refresh balance"
                      >
                        🔄
                      </button>
                    </div>
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      placeholder="0.0"
                      className="input input-bordered w-full"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                    />
                    <div className="dropdown">
                      <label tabIndex={0} className="btn m-1">
                        {fromToken?.symbol || "Select"}
                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0l10-10a1 1 0 01-1.414 0l-10 10a1 1 0 011.414 0z"/></svg>
                      </label>
                      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-h-60 overflow-y-auto">
                        {availableTokens.map((token) => (
                          <li key={token.address}>
                            <a 
                              onClick={() => setFromToken(token)}
                              className="flex justify-between items-center"
                            >
                              <div>
                                <div className="font-semibold">{token.symbol}</div>
                                <div className="text-xs text-gray-500">{token.name}</div>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center my-4">
                  <button 
                    className="btn btn-circle btn-outline"
                    onClick={() => {
                      const temp = fromToken;
                      setFromToken(toToken);
                      setToToken(temp);
                    }}
                  >
                    <ArrowLeftIcon className="h-6 w-6 rotate-180" />
                  </button>
                </div>

                {/* To Token Selection */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">To</span>
                    <div className="flex items-center gap-2">
                      <span className="label-text-alt">Balance: {toBalance} {toToken?.symbol || "Select"}</span>
                      <button
                        onClick={() => updateBalances(true)}
                        className="btn btn-ghost btn-xs"
                        title="Refresh balance"
                      >
                        🔄
                      </button>
                    </div>
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      placeholder="0.0"
                      className="input input-bordered w-full"
                      value={toAmount}
                      onChange={(e) => setToAmount(e.target.value)}
                      readOnly
                    />
                    <div className="dropdown">
                      <label tabIndex={0} className="btn m-1">
                        {toToken?.symbol || "Select"}
                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0l10-10a1 1 0 01-1.414 0l-10 10a1 1 0 011.414 0z"/></svg>
                      </label>
                      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-h-60 overflow-y-auto">
                        {availableTokens.map((token) => (
                          <li key={token.address}>
                            <a 
                              onClick={() => setToToken(token)}
                              className="flex justify-between items-center"
                            >
                              <div>
                                <div className="font-semibold">{token.symbol}</div>
                                <div className="text-xs text-gray-500">{token.name}</div>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info mt-4">
                  <div className="flex flex-col space-y-1">
                    <span>Exchange Rate: {TokenRegistry.getExchangeRate(fromToken, toToken)}</span>
                    {fromAmount && fromToken && toToken && toAmount && (
                      <span className="text-xs">
                        You will receive: {Number(toAmount).toLocaleString()} {toToken.symbol}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-control mt-6">
                  <button
                    className="btn btn-primary btn-lg w-full"
                    onClick={handleSwap}
                    disabled={!connectedAddress || !fromAmount || !fromToken || !toToken || isSwapping}
                  >
                    {isSwapping ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Swapping...
                      </>
                    ) : connectedAddress ? (
                      "Swap"
                    ) : (
                      "Connect Wallet"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;