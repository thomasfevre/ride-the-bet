import { useState } from "react";
import { useActiveAccount, TransactionButton } from "thirdweb/react";
import { getContract, prepareContractCall, toWei } from "thirdweb";
import { client, spicyTestnet } from "../lib/thirdweb";
import { RIDETHEBET_ADDRESS, RIDETHEBET_ABI, MOCK_PSG_ADDRESS } from "../constants/contracts";
import { useBetCatalog } from "../hooks/useBetCatalog";
import toast from "react-hot-toast";

const ridethebetContract = getContract({ 
  client, 
  chain: spicyTestnet, 
  address: RIDETHEBET_ADDRESS,
  abi: RIDETHEBET_ABI 
});

export default function CreateBet() {
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [selectedBetTypeId, setSelectedBetTypeId] = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState("1");
  const account = useActiveAccount();
  const { matches, loading, error, getMatchById } = useBetCatalog();

  const selectedMatch = selectedMatchId ? getMatchById(selectedMatchId) : null;

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
          <p className="text-dynamic-secondary font-medium">Connect your wallet to create a prediction duel</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-card-dynamic border border-dynamic rounded-3xl shadow-dynamic p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-white text-sm">⚡</span>
          </div>
          <h2 className="text-lg font-bold text-dynamic">
            Loading Bet Catalog...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card-dynamic border border-dynamic rounded-3xl shadow-dynamic p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-danger-500 to-warning-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-sm">⚠️</span>
          </div>
          <h2 className="text-lg font-bold text-dynamic">
            Error Loading Bets
          </h2>
        </div>
        <p className="text-dynamic-secondary">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-card-dynamic border border-dynamic rounded-3xl shadow-dynamic hover:shadow-hover-dynamic p-6 transition-all duration-300 hover:scale-[1.02] animate-slide-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white text-sm">⚡</span>
        </div>
        <h2 className="text-lg font-bold text-dynamic">
          Create Prediction Duel
        </h2>
      </div>
      
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* Match Selection */}
        <div>
          <label className="block text-sm font-medium text-dynamic-secondary mb-2">
            Select Match
          </label>
          <select
            value={selectedMatchId || ""}
            onChange={(e) => {
              const matchId = e.target.value ? Number(e.target.value) : null;
              setSelectedMatchId(matchId);
              setSelectedBetTypeId(null); // Reset bet type when match changes
            }}
            className="w-full px-4 py-3 bg-card-dynamic border border-dynamic rounded-2xl text-dynamic focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Choose a match...</option>
            {matches.map((match) => (
              <option key={match.matchId} value={match.matchId}>
                {match.matchDescription}
              </option>
            ))}
          </select>
        </div>

        {/* Bet Type Selection */}
        {selectedMatch && (
          <div>
            <label className="block text-sm font-medium text-dynamic-secondary mb-2">
              Select Bet Type
            </label>
            <select
              value={selectedBetTypeId || ""}
              onChange={(e) => setSelectedBetTypeId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-3 bg-card-dynamic border border-dynamic rounded-2xl text-dynamic focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Choose a bet type...</option>
              {selectedMatch.allowedBetTypes.map((betType) => (
                <option key={betType.betTypeId} value={betType.betTypeId}>
                  {betType.betDescription}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Stake Amount */}
        <div>
          <label className="block text-sm font-medium text-dynamic-secondary mb-2">
            Your Stake (PSG tokens)
          </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            className="w-full px-4 py-3 bg-card-dynamic border border-dynamic rounded-2xl text-dynamic focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            placeholder="1.0"
          />
        </div>

        {/* Preview */}
        {selectedMatch && selectedBetTypeId && (
          <div className="p-4 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-2xl border border-dynamic">
            <h3 className="text-sm font-medium text-dynamic mb-2">Preview:</h3>
            <p className="text-dynamic-secondary text-sm">
              <strong>Match:</strong> {selectedMatch.matchDescription}
            </p>
            <p className="text-dynamic-secondary text-sm">
              <strong>Prediction:</strong> {selectedMatch.allowedBetTypes.find(bt => bt.betTypeId === selectedBetTypeId)?.betDescription}
            </p>
            <p className="text-dynamic-secondary text-sm">
              <strong>Your Stake:</strong> {stakeAmount} PSG
            </p>
            <p className="text-dynamic-secondary text-sm">
              <strong>Resolves:</strong> {new Date(selectedMatch.resolutionTimestamp * 1000).toLocaleString()}
            </p>
          </div>
        )}

        {/* Create Bet Button */}
        <TransactionButton
          transaction={() => {
            if (!selectedMatchId || !selectedBetTypeId || !selectedMatch) {
              throw new Error("Please select both a match and bet type");
            }
            
            return prepareContractCall({
              contract: ridethebetContract,
              method: "createBet",
              params: [
                BigInt(selectedMatchId),
                selectedBetTypeId,
                MOCK_PSG_ADDRESS,
                toWei(stakeAmount),
                BigInt(selectedMatch.resolutionTimestamp)
              ],
            });
          }}
          onTransactionSent={() => {
            toast.success("Transaction sent! Creating your prediction duel...");
          }}
          onTransactionConfirmed={() => {
            toast.success("Prediction duel created successfully! 🎯");
            // Reset form
            setSelectedMatchId(null);
            setSelectedBetTypeId(null);
            setStakeAmount("1");
          }}
          onError={(error) => {
            toast.error(`Failed to create bet: ${error.message}`);
          }}
          disabled={!selectedMatchId || !selectedBetTypeId || !stakeAmount}
          className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {selectedMatchId && selectedBetTypeId ? "Create Prediction Duel 🚀" : "Select Match & Bet Type"}
        </TransactionButton>
      </form>
    </div>
  );
}
