import { DebugContracts } from "./_components/DebugContracts";
import { TestBalance } from "~~/components/TestBalance";
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Debug Contracts - Nexus DEX",
  description: "Debug your deployed Nexus DEX contracts in an easy way",
});

const Debug: NextPage = () => {
  return (
    <>
      <DebugContracts />

      {/* Test Balance Component */}
      <div className="container mx-auto px-4 py-8">
        <TestBalance />
      </div>

      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Nexus DEX Debug Contracts</h1>
        <p className="text-neutral mb-4">
          Debug and interact with your deployed Nexus DEX smart contracts.
        </p>
        
        <div className="bg-base-100 p-6 rounded-lg text-left max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">📋 Available Contracts</h2>
          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold">DEXFactory</h3>
              <p className="text-sm text-gray-600">Creates and manages trading pairs</p>
              <code className="text-xs bg-gray-200 p-2 rounded">createPair(address,address)</code>
            </div>
            
            <div className="border-l-4 border-secondary pl-4">
              <h3 className="font-semibold">DEXRouter</h3>
              <p className="text-sm text-gray-600">Handles swaps and liquidity operations</p>
              <code className="text-xs bg-gray-200 p-2 rounded">swapExactTokensForTokens(uint,address[],address)</code>
            </div>
            
            <div className="border-l-4 border-accent pl-4">
              <h3 className="font-semibold">DEXPair</h3>
              <p className="text-sm text-gray-600">Individual trading pair contracts</p>
              <code className="text-xs bg-gray-200 p-2 rounded">getReserves() - mint(address) - burn(address)</code>
            </div>
            
            <div className="border-l-4 border-warning pl-4">
              <h3 className="font-semibold">WETH</h3>
              <p className="text-sm text-gray-600">Wrapped Nexus token for ETH trading</p>
              <code className="text-xs bg-gray-200 p-2 rounded">deposit() - withdraw(uint)</code>
            </div>
            
            <div className="border-l-4 border-info pl-4">
              <h3 className="font-semibold">TestToken (NEXA/NEXB)</h3>
              <p className="text-sm text-gray-600">ERC20 test tokens for trading</p>
              <code className="text-xs bg-gray-200 p-2 rounded">transfer(address,uint) - approve(address,uint)</code>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-info/10 rounded-lg">
            <h3 className="font-semibold text-info mb-2">🔧 Network Configuration</h3>
            <div className="text-sm space-y-1">
              <p><strong>Network:</strong> Nexus Testnet3</p>
              <p><strong>Chain ID:</strong> 3945</p>
              <p><strong>RPC URL:</strong> https://testnet.rpc.nexus.xyz</p>
              <p><strong>Explorer:</strong> https://nexus.testnet.blockscout.com/</p>
              <p><strong>Gas Token:</strong> NEX</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-warning/10 rounded-lg">
            <h3 className="font-semibold text-warning mb-2">📝 How to Use</h3>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Deploy contracts using: <code className="bg-gray-200 px-1">yarn deploy --network nexusTestnet</code></li>
              <li>Get test tokens from Nexus faucet</li>
              <li>Use the Swap page to trade tokens</li>
              <li>Add liquidity to earn trading fees</li>
              <li>Debug contract interactions here</li>
            </ol>
          </div>
        </div>
        
        <p className="text-neutral mt-6">
          Check{" "}
          <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">
            packages/nextjs/app/debug/page.tsx
          </code>{" "}
          to modify this debug page.
        </p>
      </div>
    </>
  );
};

export default Debug;
