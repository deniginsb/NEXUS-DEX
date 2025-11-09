"use client";

import Link from "next/link";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ArrowsRightLeftIcon, CircleStackIcon } from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Nexus DEX
            </h1>
            <p className="text-lg text-gray-600">
              Decentralized Exchange on Nexus Testnet3
            </p>
          </div>

          {/* Connection Status */}
          <div className="bg-base-100 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Network:</span>
              <span className="font-medium">Nexus Testnet3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <span className="text-success font-medium">Connected</span>
            </div>
            {connectedAddress && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Your Address:</p>
                <Address
                  address={connectedAddress}
                  chain={targetNetwork}
                />
              </div>
            )}
          </div>

          {/* DEX Actions */}
          <div className="grid grid-cols-1 gap-4">
            <Link
              href="/swap"
              className="btn btn-primary btn-lg rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <ArrowsRightLeftIcon className="h-6 w-6" />
              <span>Swap Tokens</span>
            </Link>

            <Link
              href="/liquidity"
              className="btn btn-secondary btn-lg rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <CircleStackIcon className="h-6 w-6" />
              <span>Add Liquidity</span>
            </Link>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-info/10 rounded-xl p-4">
            <h3 className="font-semibold text-info mb-2">About Nexus DEX</h3>
            <p className="text-sm text-gray-600">
              Nexus DEX is a decentralized automated market maker (AMM) built on Nexus Layer 1 blockchain.
              Trade tokens, provide liquidity, and earn fees on the verified computing network.
            </p>
          </div>

          {/* Quick Links */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="https://nexus.testnet.blockscout.com/"
                target="_blank"
                className="link link-primary block"
              >
                Nexus Explorer →
              </Link>
              <Link
                href="https://testnet.rpc.nexus.xyz"
                target="_blank"
                className="link link-primary block"
              >
                RPC Endpoint →
              </Link>
              <Link
                href="https://docs.nexus.xyz"
                target="_blank"
                className="link link-primary block"
              >
                Documentation →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
