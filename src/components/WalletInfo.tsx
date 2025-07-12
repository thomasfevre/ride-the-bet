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
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Wallet Info</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Address:</span>
          <span className="text-sm font-mono text-gray-900">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">CHZ Balance:</span>
          <span className="text-sm font-medium text-gray-900">
            {isLoadingCHZ ? "..." : `${parseFloat(chzBalance?.displayValue || "0").toFixed(4)} CHZ`}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">PSG Balance:</span>
          <span className="text-sm font-medium text-gray-900">
            {isLoadingPSG ? "..." : `${(Number(psgBalance || 0) / 10**18).toFixed(2)} PSG`}
          </span>
        </div>
      </div>

      {psgBalance && Number(psgBalance) === 0 && (
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-800">
            💡 You need PSG tokens to participate in duels. Ask the contract owner to mint some for you!
          </p>
        </div>
      )}
    </div>
  );
}
