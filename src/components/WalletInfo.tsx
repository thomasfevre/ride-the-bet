import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { getContract } from "thirdweb";
import { client, spicyTestnet } from "../lib/thirdweb";
import { MOCK_PSG_ADDRESS, MOCK_PSG_ABI } from "../constants/contracts";
import { useReadContract } from "thirdweb/react";

const psgContract = getContract({ 
  client, 
  chain: spicyTestnet, 
  address: MOCK_PSG_ADDRESS,
  abi: MOCK_PSG_ABI 
});

export default function WalletInfo() {
  const account = useActiveAccount();
  
  const { data: chzBalance, isLoading: isLoadingCHZ } = useWalletBalance({
    client,
    chain: spicyTestnet,
    address: account?.address,
  });

  const { data: psgBalance, isLoading: isLoadingPSG } = useReadContract({
    contract: psgContract,
    method: "balanceOf",
    params: [account?.address || "0x0"]
  });

  if (!account) {
    return null;
  }

  return (
    <div className="bg-card-dynamic border border-dynamic rounded-3xl shadow-dynamic hover:shadow-hover-dynamic p-6 transition-all duration-300 hover:scale-[1.02] animate-slide-in">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white text-sm">💰</span>
        </div>
        <h3 className="text-lg font-bold text-dynamic">Wallet Info</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-card-dynamic border border-dynamic rounded-2xl">
          <span className="text-sm text-dynamic-secondary font-medium">Address:</span>
          <span className="text-sm font-mono text-dynamic bg-card-dynamic border border-dynamic px-3 py-1 rounded-xl">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl border border-dynamic">
          <span className="text-sm text-dynamic-secondary font-medium">PSG Balance:</span>
          <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
            {isLoadingPSG ? (
              <div className="animate-pulse">...</div>
            ) : (
                `${(Number(psgBalance || 0) / 10**18).toFixed(2)} PSG`
            )}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 rounded-2xl">
          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">CHZ Balance:</span>
          <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
            {isLoadingCHZ ? (
              <div className="animate-pulse">...</div>
            ) : (
              `${parseFloat(chzBalance?.displayValue || "0").toFixed(4)} CHZ`
            )}
          </span>
        </div>
      </div>

      {psgBalance && Number(psgBalance) === 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-700/50">
          <div className="flex items-center space-x-2">
            <span className="text-amber-500">💡</span>
            <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
              You need PSG tokens to participate in duels. Ask the contract owner to mint some for you!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
