import { useState } from "react";
import { useActiveAccount, TransactionButton } from "thirdweb/react";
import { getContract, prepareContractCall, toWei } from "thirdweb";
import { client, spicyTestnet } from "../lib/thirdweb";
import { RIDETHEBET_ADDRESS, RIDETHEBET_ABI, MOCK_PSG_ADDRESS } from "../constants/contracts";

const ridethebetContract = getContract({ 
  client, 
  chain: spicyTestnet, 
  address: RIDETHEBET_ADDRESS,
  abi: RIDETHEBET_ABI 
});

export default function CreateBet() {
  const [description, setDescription] = useState("");
  const [stakeAmount, setStakeAmount] = useState("1");
  const [resolutionDays, setResolutionDays] = useState("7");
  const account = useActiveAccount();

  if (!account) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Create Prediction Duel
        </h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🔌</div>
          <p className="text-gray-500">Connect your wallet to create a prediction duel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Create Prediction Duel
      </h2>
      
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Prediction Statement
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., PSG will win their next match against Barcelona"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/200 characters
          </p>
        </div>

        {/* Stake Amount */}
        <div>
          <label htmlFor="stake" className="block text-sm font-medium text-gray-700 mb-1">
            Your Stake (PSG Tokens)
          </label>
          <input
            id="stake"
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="1.0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0.1"
            step="0.1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum stake required to create a duel
          </p>
        </div>

        {/* Resolution Time */}
        <div>
          <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">
            Resolution Time (Days from now)
          </label>
          <select
            id="resolution"
            value={resolutionDays}
            onChange={(e) => setResolutionDays(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1">1 Day</option>
            <option value="3">3 Days</option>
            <option value="7">1 Week</option>
            <option value="14">2 Weeks</option>
            <option value="30">1 Month</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            When the prediction can be resolved
          </p>
        </div>

        {/* Create Button */}
        <TransactionButton
          transaction={() => {
            if (!description.trim() || !stakeAmount || !resolutionDays) {
              throw new Error("Please fill in all fields");
            }

            const resolutionTimestamp = Math.floor(Date.now() / 1000) + (parseInt(resolutionDays) * 24 * 60 * 60);
            const stake = toWei(stakeAmount);

            return prepareContractCall({
              contract: ridethebetContract,
              method: "createBet",
              params: [
                description.trim(),
                MOCK_PSG_ADDRESS,
                stake,
                BigInt(resolutionTimestamp)
              ],
            });
          }}
          onTransactionSent={(result) => {
            console.log("Create bet transaction submitted", result.transactionHash);
          }}
          onTransactionConfirmed={(result) => {
            console.log("Create bet transaction confirmed", result.transactionHash);
            // Reset form
            setDescription("");
            setStakeAmount("1");
            setResolutionDays("7");
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🚀 Create Prediction Duel
        </TransactionButton>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">How it works:</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Create a prediction and stake tokens</li>
          <li>• Others can support (upvote) or doubt (downvote) your prediction</li>
          <li>• After resolution time, an admin resolves the outcome</li>
          <li>• Winners share the losing side's pool proportionally</li>
        </ul>
      </div>
    </div>
  );
}
