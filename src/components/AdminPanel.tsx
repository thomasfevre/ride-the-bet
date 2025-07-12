import { useState } from "react";
import { useActiveAccount, useReadContract, TransactionButton } from "thirdweb/react";
import { getContract, prepareContractCall, toWei } from "thirdweb";
import { client, spicyTestnet } from "../lib/thirdweb";
import { MOCK_PSG_ADDRESS, MOCK_PSG_ABI, RIDETHEBET_ADDRESS, RIDETHEBET_ABI } from "../constants/contracts";

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
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Admin Panel</h3>
      
      {/* PSG Token Minting */}
      {isPSGOwner && (
        <div className="mb-6 p-4 border border-blue-200 rounded-lg">
          <h4 className="text-md font-medium text-blue-900 mb-3">PSG Token Minting</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Address
              </label>
              <input
                type="text"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (PSG)
              </label>
              <input
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              🪙 Mint PSG Tokens
            </TransactionButton>
            
            {/* Quick mint buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setMintAddress(account.address)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
              >
                Use My Address
              </button>
              <button
                onClick={() => setMintAmount("1000")}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
              >
                1000 PSG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RideTheBet Admin */}
      {isRideTheBetOwner && (
        <div className="p-4 border border-green-200 rounded-lg">
          <h4 className="text-md font-medium text-green-900 mb-3">Contract Administration</h4>
          <p className="text-sm text-green-700">
            You can resolve expired bets using the resolve buttons on individual bet cards.
          </p>
        </div>
      )}
    </div>
  );
}
