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
      <div className="bg-card-dynamic border border-dynamic rounded-3xl shadow-dynamic p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-sm">⚡</span>
          </div>
          <h2 className="text-lg font-bold text-dynamic">
            Create Prediction Duel
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="text-6xl mb-4 animate-float">🔌</div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Connect your wallet to create a prediction duel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-card hover:shadow-hover border border-gray-200/50 dark:border-gray-700/50 p-6 transition-all duration-300 hover:scale-[1.02] animate-slide-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center">
          <span className="text-white text-sm">⚡</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Create Prediction Duel
        </h2>
      </div>
      
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Prediction Statement
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., PSG will win their next match against Barcelona"
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
            {description.length}/200 characters
          </p>
        </div>

        {/* Stake Amount */}
        <div>
          <label htmlFor="stake" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Your Stake (PSG Tokens)
          </label>
          <div className="relative">
            <input
              id="stake"
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="1.0"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
              min="0.1"
              step="0.1"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium text-sm">
              PSG
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Minimum stake required to create a duel
          </p>
        </div>

        {/* Resolution Time */}
        <div>
          <label htmlFor="resolution" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Resolution Time (Days from now)
          </label>
          <select
            id="resolution"
            value={resolutionDays}
            onChange={(e) => setResolutionDays(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
          >
            <option value="1">1 Day</option>
            <option value="3">3 Days</option>
            <option value="7">1 Week</option>
            <option value="14">2 Weeks</option>
            <option value="30">1 Month</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
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
          className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow hover:scale-105 transform"
        >
          🚀 Create Prediction Duel
        </TransactionButton>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-700/50">
        <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
          <span className="mr-2">ℹ️</span>
          How it works:
        </h3>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-2 font-medium">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            Create a prediction and stake tokens
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            Others can support (upvote) or doubt (downvote) your prediction
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            After resolution time, an admin resolves the outcome
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            Winners share the losing side's pool proportionally
          </li>
        </ul>
      </div>
    </div>
  );
}
