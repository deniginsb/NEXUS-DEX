"use client";

import { useAccount, useBalance } from "wagmi";
import { TokenRegistry } from "~~/utils/tokenRegistry";
import { Address } from "viem";
import { useEffect, useState } from "react";

export const TestBalance = () => {
  const { address, isConnected } = useAccount();
  const [registryBalance, setRegistryBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  // Get balance using wagmi's useBalance (this is what the UI uses)
  const { data: wagmiBalance, isLoading: wagmiLoading, isError: wagmiError } = useBalance({
    address: address,
  });

  // Get balance using our TokenRegistry
  useEffect(() => {
    const fetchRegistryBalance = async () => {
      if (!address || !isConnected) return;

      setLoading(true);
      try {
        console.log("🔍 Fetching balance using TokenRegistry for:", address);

        const nepxToken = TokenRegistry.findTokenBySymbol("NEX");
        console.log("📝 Found NEX token:", nepxToken);

        if (!nepxToken) {
          console.error("❌ NEX token not found in registry!");
          setRegistryBalance("0");
          return;
        }

        console.log("💰 Calling TokenRegistry.getTokenBalance...");
        const balance = await TokenRegistry.getTokenBalance(nepxToken, address);
        console.log("✅ TokenRegistry balance result:", balance);
        setRegistryBalance(balance);
      } catch (error) {
        console.error("❌ Error fetching from TokenRegistry:", error);
        setRegistryBalance("0");
      } finally {
        setLoading(false);
      }
    };

    fetchRegistryBalance();
  }, [address, isConnected]);

  if (!isConnected) {
    return <div className="p-4">Please connect wallet first</div>;
  }

  return (
    <div className="p-4 space-y-4 border rounded-lg bg-base-200">
      <h3 className="text-lg font-bold">Balance Debug</h3>

      <div className="space-y-2">
        <div>
          <strong>Address:</strong> {address}
        </div>

        <div>
          <strong>Wagmi Balance (default UI):</strong>
          {wagmiLoading && <span className="ml-2">Loading...</span>}
          {wagmiError && <span className="ml-2 text-error">Error!</span>}
          {wagmiBalance && (
            <span className="ml-2">
              {wagmiBalance.formatted} {wagmiBalance.symbol}
            </span>
          )}
        </div>

        <div>
          <strong>TokenRegistry Balance (custom):</strong>
          {loading && <span className="ml-2">Loading...</span>}
          {!loading && (
            <span className="ml-2">
              {registryBalance} NEX
            </span>
          )}
        </div>

        <div className="mt-4 p-2 bg-base-300 rounded text-xs">
          <strong>Debug Info:</strong>
          <div>wagmiLoading: {wagmiLoading.toString()}</div>
          <div>wagmiError: {wagmiError.toString()}</div>
          <div>wagmiBalance: {wagmiBalance ? "exists" : "null"}</div>
          <div>registryBalance: {registryBalance}</div>
          <div>loading: {loading.toString()}</div>
        </div>
      </div>
    </div>
  );
};
