import { useState } from "react";
import { useActiveAccount, useWalletBalance, useReadContract, TransactionButton } from "thirdweb/react";
import { getContract, prepareContractCall, readContract } from "thirdweb";
import { client, spicyTestnet } from "../lib/thirdweb";
import { MOCK_PSG_ADDRESS, MOCK_PSG_ABI, RIDETHEBET_ADDRESS, RIDETHEBET_ABI } from "../constants/contracts";
import toast from "react-hot-toast";

const psgContract = getContract({ 
  client, 
  chain: spicyTestnet, 
  address: MOCK_PSG_ADDRESS,
  abi: MOCK_PSG_ABI 
});

const ridethebetContract = getContract({ 
  client, 
  chain: spicyTestnet, 
  address: RIDETHEBET_ADDRESS,
  abi: RIDETHEBET_ABI 
});

export default function WalletInfo() {
  const account = useActiveAccount();
  const [influencerName, setInfluencerName] = useState("");
  const [showRegistration, setShowRegistration] = useState(false);
  
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

  const { data: registeredName, isLoading: isLoadingName, refetch: refetchName } = useReadContract({
    contract: ridethebetContract,
    method: "getInfluencerPseudoByAddress",
    params: [account?.address || "0x0"]
  });
    
    console.log("address", account?.address);
    console.log("contract response registeredName", registeredName);

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
        {/* Influencer Registration Status */}
        <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl border border-dynamic">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-dynamic flex items-center space-x-2">
              <span className="text-lg">🎯</span>
              <span>Influencer Status</span>
            </span>
            {isLoadingName && (
              <div className="animate-pulse w-20 h-4 bg-dynamic-secondary/20 rounded"></div>
            )}
          </div>
          
          {registeredName && registeredName.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dynamic-secondary">Registered as:</span>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-xl">
                  {registeredName}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-success-600 dark:text-success-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Verified Influencer - You can create prediction duels!</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dynamic-secondary">Status:</span>
                <span className="text-sm text-warning-600 dark:text-warning-400 bg-warning-100 dark:bg-warning-900/30 px-3 py-1 rounded-xl flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Not Registered</span>
                </span>
              </div>
              <p className="text-xs text-dynamic-secondary">
                Register to become a verified influencer and create prediction duels
              </p>
              
              {!showRegistration ? (
                <button
                  onClick={() => setShowRegistration(true)}
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm"
                >
                  Register as Influencer 🚀
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={influencerName}
                    onChange={(e) => setInfluencerName(e.target.value)}
                    placeholder="Enter your unique pseudonym (min 3 characters)..."
                    className="w-full px-3 py-2 bg-card-dynamic border border-dynamic rounded-xl text-dynamic text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    maxLength={50}
                  />
                  {influencerName.length > 0 && influencerName.length < 3 && (
                    <p className="text-xs text-warning-600 dark:text-warning-400">
                      Name must be at least 3 characters long
                    </p>
                  )}
                  <div className="flex space-x-2">
                    <TransactionButton
                      transaction={async () => {
                        if (!influencerName.trim()) {
                          throw new Error("Please enter a valid name");
                        }
                        if (influencerName.trim().length < 3) {
                          throw new Error("Name must be at least 3 characters long");
                        }
                        
                        // Check if name is already taken before sending transaction
                        try {
                          const nameOwnerResponse = await readContract({
                            contract: ridethebetContract,
                            method: "influencerNames",
                            params: [influencerName.trim()]
                          });
                          const isNameTaken = nameOwnerResponse && nameOwnerResponse !== "0x0000000000000000000000000000000000000000";
                          
                          if (isNameTaken) {
                            throw new Error("This name is already taken! Please choose another one.");
                          }
                        } catch (error: any) {
                          if (error.message.includes("already taken")) {
                            throw error; // Re-throw our custom error
                          }
                          // If it's a contract call error, it might mean the name doesn't exist (which is good)
                          console.log("Name check result:", error);
                        }
                        
                        return prepareContractCall({
                          contract: ridethebetContract,
                          method: "registerInfluencer",
                          params: [influencerName.trim()],
                        });
                      }}
                      onTransactionSent={() => {
                        toast.success("Registration transaction sent! 📡");
                      }}
                      onTransactionConfirmed={() => {
                        toast.success("Successfully registered as influencer! 🎉");
                        setShowRegistration(false);
                        setInfluencerName("");
                        refetchName();
                      }}
                      onError={(error) => {
                        const errorMessage = error.message;
                        if (errorMessage.includes("already taken")) {
                          toast.error("This name is already taken! Please choose another one.");
                        } else if (errorMessage.includes("Name is already registered")) {
                          toast.error("This name is already taken! Please choose another one.");
                        } else if (errorMessage.includes("Name cannot be empty")) {
                          toast.error("Please enter a valid name.");
                        } else {
                          toast.error(`Registration failed: ${errorMessage}`);
                        }
                      }}
                      disabled={!influencerName.trim() || influencerName.trim().length < 3}
                      className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium py-2 px-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                    >
                      Register
                    </TransactionButton>
                    <button
                      onClick={() => {
                        setShowRegistration(false);
                        setInfluencerName("");
                      }}
                      className="px-3 py-2 bg-card-dynamic border border-dynamic text-dynamic-secondary rounded-xl hover:bg-dynamic-secondary/10 transition-all duration-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

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
