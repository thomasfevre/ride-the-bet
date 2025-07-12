import { useState } from "react";
import { useActiveAccount, useReadContract, TransactionButton } from "thirdweb/react";
import { getContract, prepareContractCall, toWei } from "thirdweb";
import { client, spicyTestnet } from "../lib/thirdweb";
import { MOCK_PSG_ADDRESS, MOCK_PSG_ABI, RIDETHEBET_ADDRESS, RIDETHEBET_ABI } from "../constants/contracts";
import { Button } from "./ui/Button";

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

export default function AdminPanel() {
  const [mintAddress, setMintAddress] = useState("");
  const [mintAmount, setMintAmount] = useState("100");
  const account = useActiveAccount();

  const { data: psgOwner } = useReadContract({
    contract: psgContract,
    method: "owner",
    params: []
  });

  const { data: ridethebetOwner } = useReadContract({
    contract: ridethebetContract,
    method: "owner",
    params: []
  });

  const isPSGOwner = account && psgOwner && account.address.toLowerCase() === psgOwner.toLowerCase();
  const isRideTheBetOwner = account && ridethebetOwner && account.address.toLowerCase() === ridethebetOwner.toLowerCase();

  if (!account || (!isPSGOwner && !isRideTheBetOwner)) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 backdrop-blur-lg rounded-3xl shadow-card hover:shadow-hover border border-purple-200/50 dark:border-purple-700/50 p-6 transition-all duration-300 hover:scale-[1.02] animate-slide-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center animate-glow">
          <span className="text-white text-sm">🔧</span>
        </div>
        <h3 className="text-lg font-bold gradient-text">Admin Panel</h3>
      </div>
      
      {/* PSG Token Minting */}
      {isPSGOwner && (
        <div className="mb-6 p-4 bg-white/60 dark:bg-gray-800/60 border border-purple-200 dark:border-purple-700 rounded-2xl">
          <h4 className="text-md font-bold text-purple-900 dark:text-purple-300 mb-4 flex items-center">
            <span className="mr-2">💰</span>
            PSG Token Minting
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500 font-mono text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Amount (PSG)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  placeholder="100"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                  min="1"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium text-sm">
                  PSG
                </div>
              </div>
            </div>
            
            <TransactionButton
              transaction={() => {
                if (!mintAddress || !mintAmount) {
                  throw new Error("Please fill in all fields");
                }
                return prepareContractCall({
                  contract: psgContract,
                  method: "mint",
                  params: [mintAddress, toWei(mintAmount)],
                });
              }}
              onTransactionConfirmed={() => {
                setMintAddress("");
                setMintAmount("100");
              }}
              className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 dark:from-white dark:to-gray-100 dark:text-gray-900 dark:hover:from-gray-100 dark:hover:to-gray-200"
            >
              🪙 Mint PSG Tokens
            </TransactionButton>
            
            {/* Quick mint buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => setMintAddress(account.address)}
                variant="secondary"
                size="sm"
              >
                Use My Address
              </Button>
              <Button
                onClick={() => setMintAmount("1000")}
                variant="secondary"
                size="sm"
              >
                1000 PSG
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RideTheBet Admin */}
      {isRideTheBetOwner && (
        <div className="p-4 bg-white/60 dark:bg-gray-800/60 border border-emerald-200 dark:border-emerald-700 rounded-2xl">
          <h4 className="text-md font-bold text-emerald-900 dark:text-emerald-300 mb-3 flex items-center">
            <span className="mr-2">⚖️</span>
            Contract Administration
          </h4>
          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            You can resolve expired bets using the resolve buttons on individual bet cards.
          </p>
        </div>
      )}
    </div>
  );
}
