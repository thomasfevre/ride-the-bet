import { useState } from "react";
import { useActiveAccount, TransactionButton, useReadContract } from "thirdweb/react";
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

type BetCategory = 'general' | 'goals' | 'players' | 'special';

const categorizeBetTypes = (betTypes: any[]) => {
  const categories: Record<BetCategory, any[]> = {
    general: [],
    goals: [],
    players: [],
    special: []
  };

  betTypes.forEach(bet => {
    const desc = bet.betDescription.toLowerCase();
    if (desc.includes('goal') || desc.includes('over') || desc.includes('under') || desc.includes('total')) {
      categories.goals.push(bet);
    } else if (desc.includes('score') || desc.includes('point') || desc.includes('assist') || desc.includes('rebound')) {
      categories.players.push(bet);
    } else if (desc.includes('card') || desc.includes('corner') || desc.includes('penalty') || desc.includes('overtime') || desc.includes('triple') || desc.includes('clean sheet')) {
      categories.special.push(bet);
    } else {
      categories.general.push(bet);
    }
  });

  return categories;
};

export default function CreateBet() {
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [selectedBetTypeId, setSelectedBetTypeId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<BetCategory>('general');
  const [stakeAmount, setStakeAmount] = useState("1");
  const account = useActiveAccount();
  const { matches, loading, error, getMatchById } = useBetCatalog();

  // Check if user is registered as an influencer
  const { data: registeredName, isLoading: isLoadingName } = 
    useReadContract({
        contract: ridethebetContract,
        method: "influencerNames",
        params: [account?.address!], // Pass the address directly
        // This hook will only run when account.address is defined
        queryOptions: {
            enabled: !!account?.address 
        }
      });

  const selectedMatch = selectedMatchId ? getMatchById(selectedMatchId) : null;
  const isRegisteredInfluencer = registeredName && registeredName.length > 0;

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

  if (loading || isLoadingName) {
    return (
      <div className="bg-card-dynamic border border-dynamic rounded-3xl shadow-dynamic p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-white text-sm">⚡</span>
          </div>
          <h2 className="text-lg font-bold text-dynamic">
            Loading...
          </h2>
        </div>
      </div>
    );
  }

  if (!isRegisteredInfluencer) {
    return (
      <div className="bg-card-dynamic border border-dynamic rounded-3xl shadow-dynamic p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-warning-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-sm">🎯</span>
          </div>
          <h2 className="text-lg font-bold text-dynamic">
            Influencer Registration Required
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="text-6xl mb-4 animate-float">👤</div>
          <p className="text-dynamic-secondary font-medium mb-4">
            You need to register as an influencer before creating prediction duels
          </p>
          <p className="text-dynamic-secondary text-sm">
            Please register in the Wallet Info section first
          </p>
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-sm">⚡</span>
          </div>
          <h2 className="text-lg font-bold text-dynamic">
            Create Prediction Duel
          </h2>
        </div>
        <div className="text-right">
          <p className="text-xs text-dynamic-secondary">Creating as:</p>
          <p className="text-sm font-bold text-dynamic">
            {registeredName}
          </p>
        </div>
      </div>
      
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* Match Selection */}
        <div>
          <label className="block text-sm font-medium text-dynamic-secondary mb-4">
            Choose Match
          </label>
          <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
            {matches.map((match) => (
              <button
                key={match.matchId}
                type="button"
                onClick={() => {
                  setSelectedMatchId(match.matchId);
                  setSelectedBetTypeId(null); // Reset bet type when match changes
                  setActiveCategory('general'); // Reset to general category
                }}
                className={`p-4 rounded-lg text-left transition-all duration-200 ${
                  selectedMatchId === match.matchId
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white border-2 border-gray-700 shadow-lg scale-[1.02] dark:from-white dark:to-gray-100 dark:text-gray-900 dark:border-gray-300'
                    : 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md hover:scale-[1.01] dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-dynamic mb-1">
                      {match.matchDescription}
                    </h3>
                    <p className="text-xs text-dynamic-secondary">
                      Resolves: {new Date(match.resolutionTimestamp * 1000).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-dynamic-secondary">
                      {match.allowedBetTypes.length} betting options available
                    </p>
                  </div>
                  {selectedMatchId === match.matchId && (
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-800 dark:bg-white rounded-full flex items-center justify-center ml-3">
                      <svg className="w-4 h-4 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bet Type Selection - Categorized */}
        {selectedMatch && (
          <div>
            <label className="block text-sm font-medium text-dynamic-secondary mb-4">
              Select Your Prediction
            </label>
            
            {(() => {
              const categorizedBets = categorizeBetTypes(selectedMatch.allowedBetTypes);
              const categoryIcons: Record<BetCategory, string> = {
                general: '🏆',
                goals: '⚽',
                players: '👨‍💼',
                special: '✨'
              };
              const categoryLabels: Record<BetCategory, string> = {
                general: 'Match Result',
                goals: 'Goals & Totals',
                players: 'Player Props',
                special: 'Special Bets'
              };

              return (
                <>
                  {/* Category Tabs */}
                  <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                    {(Object.keys(categorizedBets) as BetCategory[]).map((category) => {
                      const betsInCategory = categorizedBets[category];
                      if (betsInCategory.length === 0) return null;
                      
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setActiveCategory(category)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                            activeCategory === category
                              ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg dark:from-white dark:to-gray-100 dark:text-gray-900'
                              : 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800/20'
                          }`}
                        >
                          <span className="text-lg">{categoryIcons[category]}</span>
                          <span>{categoryLabels[category]}</span>
                          <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                            {betsInCategory.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bet Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto animate-fade-in">
                    {categorizedBets[activeCategory].map((betType, index) => (
                      <button
                        key={betType.betTypeId}
                        type="button"
                        onClick={() => setSelectedBetTypeId(betType.betTypeId)}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className={`p-4 rounded-lg text-left transition-all duration-200 animate-slide-in-up ${
                          selectedBetTypeId === betType.betTypeId
                            ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white border-2 border-gray-700 shadow-lg scale-105 dark:from-white dark:to-gray-100 dark:text-gray-900 dark:border-gray-300'
                            : 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md hover:scale-[1.02] dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800/20'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-sm font-medium text-dynamic leading-tight">
                            {betType.betDescription}
                          </span>
                          {selectedBetTypeId === betType.betTypeId && (
                            <div className="flex-shrink-0 w-5 h-5 bg-gray-800 dark:bg-white rounded-full flex items-center justify-center ml-2 animate-bounce-in">
                              <svg className="w-3 h-3 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}
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
            className="w-full px-4 py-3 bg-card-dynamic border border-dynamic rounded-lg text-dynamic focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
          className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 dark:from-white dark:to-gray-100 dark:text-gray-900 dark:hover:from-gray-100 dark:hover:to-gray-200"
        >
          {selectedMatchId && selectedBetTypeId ? "Create Prediction Duel 🚀" : "Select Match & Bet Type"}
        </TransactionButton>
      </form>
    </div>
  );
}
