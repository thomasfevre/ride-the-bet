import { useState } from "react";
import { useActiveAccount, TransactionButton, useReadContract } from "thirdweb/react";
import { getContract, prepareContractCall, toWei } from "thirdweb";
import { client, spicyTestnet } from "../lib/thirdweb";
import { RIDETHEBET_ADDRESS, RIDETHEBET_ABI, MOCK_PSG_ADDRESS } from "../constants/contracts";
import { useBetCatalog } from "../hooks/useBetCatalog";
import { ApprovalButton, useTokenApproval } from "../hooks/useTokenApproval";
import toast from "react-hot-toast";

const ridethebetContract = getContract({ 
  client, 
  chain: spicyTestnet, 
  address: RIDETHEBET_ADDRESS,
  abi: RIDETHEBET_ABI 
});

type BetCategory = 'general' | 'goals' | 'players' | 'special';

const categoryLabels: Record<BetCategory, string> = {
  general: 'General',
  goals: 'Goals & Scoring',
  players: 'Player Performance',
  special: 'Special Events'
};

const categoryIcons: Record<BetCategory, string> = {
  general: '⚽',
  goals: '🥅',
  players: '👤',
  special: '✨'
};

const categorizeBets = (bets: any[]) => {
  const categories: Record<BetCategory, any[]> = {
    general: [],
    goals: [],
    players: [],
    special: []
  };

  bets.forEach(bet => {
    const desc = bet.betDescription.toLowerCase();
    if (desc.includes('goal') || desc.includes('score')) {
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

  // Check approval status for creating bets
  const { needsApproval } = useTokenApproval({
    spenderAddress: RIDETHEBET_ADDRESS,
    amount: stakeAmount
  });

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
      <div className="card-dynamic border-dynamic shadow-dynamic p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">⚡</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
            Create Prediction Bet
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="text-6xl mb-4 animate-bounce">🔌</div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Connect your wallet to create a prediction bet</p>
        </div>
      </div>
    );
  }

  if (loading || isLoadingName) {
    return (
      <div className="card-dynamic border-dynamic shadow-dynamic p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-white text-xl">⚡</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
            Loading...
          </h2>
        </div>
      </div>
    );
  }

  if (!isRegisteredInfluencer) {
    return (
      <div className="card-dynamic border-dynamic shadow-dynamic p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">🎯</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
            Influencer Registration Required
          </h2>
        </div>
        <div className="text-center py-8">
          <div className="text-6xl mb-4 animate-bounce">👤</div>
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">
            You need to register as an influencer before creating prediction bets
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Please register in the Wallet Info section first
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-dynamic border-dynamic shadow-dynamic p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
            Error Loading Bets
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="card-dynamic border-dynamic shadow-dynamic p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">⚡</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Create Prediction Bet
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Start a new prediction challenge</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Match Selection */}
      <div className="card-dynamic border-dynamic shadow-dynamic">
        <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">1</span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              Select Match
            </h2>
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 gap-4">
            {matches.map((match) => (
              <div
                key={match.matchId}
                onClick={() => setSelectedMatchId(match.matchId)}
                className={`group relative cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                  selectedMatchId === match.matchId
                    ? 'card-dynamic border-dynamic shadow-xl scale-105'
                    : 'card-dynamic border-dynamic hover:shadow-lg'
                }`}
              >
                <div className="p-6">
                  {selectedMatchId === match.matchId && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="pr-8">
                    <p className="text-base font-semibold text-gray-900 dark:text-white leading-relaxed mb-3">
                      {match.matchDescription}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">
                        {match.allowedBetTypes.length} bet type{match.allowedBetTypes.length !== 1 ? 's' : ''} available
                      </span>
                      <span className="font-medium">
                        Resolves: {new Date(match.resolutionTimestamp * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Gradient border effect on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: Bet Type Selection */}
      {selectedMatch && (
        <div className="card-dynamic border-dynamic shadow-dynamic">
          <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Choose Your Prediction
              </h2>
            </div>
          </div>
          <div className="p-8">
            {(() => {
              const categorizedBets = categorizeBets(selectedMatch.allowedBetTypes);
              
              return (
                <div className="space-y-8">
                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-3">
                    {(Object.keys(categorizedBets) as BetCategory[]).map((category) => {
                      const betsInCategory = categorizedBets[category];
                      if (betsInCategory.length === 0) return null;
                      
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setActiveCategory(category)}
                          className={`flex items-center space-x-3 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                            activeCategory === category
                              ? 'card-dynamic border-dynamic text-blue-600 dark:text-blue-400 shadow-lg'
                              : 'card-dynamic border-dynamic text-gray-600 dark:text-gray-300 hover:shadow-md'
                          }`}
                        >
                          <span className="text-lg">{categoryIcons[category]}</span>
                          <span className="font-semibold">{categoryLabels[category]}</span>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-300 font-bold">
                            {betsInCategory.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bet Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categorizedBets[activeCategory].map((betType) => (
                      <div
                        key={betType.betTypeId}
                        onClick={() => setSelectedBetTypeId(betType.betTypeId)}
                        className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-105  border-b-blue-300 border-2 rounded-2xl ${
                          selectedBetTypeId === betType.betTypeId
                            ? 'card-dynamic border-dynamic shadow-xl scale-105'
                            : 'card-dynamic border-dynamic hover:shadow-lg'
                        }`}
                      >
                        <div className="p-6">
                          {selectedBetTypeId === betType.betTypeId && (
                            <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <div className="pr-8">
                            <p className="text-base font-semibold text-gray-900 dark:text-white leading-relaxed ">
                              {betType.betDescription}
                            </p>
                          </div>
                        </div>
                        
                        {/* Gradient border effect on hover */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Step 3: Stake & Confirm */}
      <div className="card-dynamic border-dynamic shadow-dynamic">
        <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">3</span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              Set Your Stake
            </h2>
          </div>
        </div>
        <div className="p-8 space-y-8">
          {/* Stake Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Stake Amount (PSG tokens)
            </label>
            <div className="relative">
              <input
                type="number"
                min="100"
                step="1"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full px-6 py-4 pr-16 rounded-xl card-dynamic border-dynamic text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-lg font-medium placeholder-gray-400"
                placeholder="1.0"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 text-sm font-bold">PSG</span>
              </div>
            </div>
          </div>

          {/* Prediction Summary */}
          {selectedMatch && selectedBetTypeId && (
            <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5"></div>
              <div className="relative">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-3 text-xl">📋</span>
                  Prediction Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Match:</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-right max-w-xs leading-relaxed">
                      {selectedMatch.matchDescription}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Prediction:</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-right max-w-xs leading-relaxed">
                      {selectedMatch.allowedBetTypes.find((bt: any) => bt.betTypeId === selectedBetTypeId)?.betDescription}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Your Stake:</span>
                    <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                      {stakeAmount} PSG
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Resolves:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {new Date(selectedMatch.resolutionTimestamp * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button with Approval */}
          <div className="space-y-3  flex items-center justify-center">
            {/* Show approval button when approval is needed */}
            {needsApproval && (
              <div className="space-y-3 ">
                
                <ApprovalButton
                  spenderAddress={RIDETHEBET_ADDRESS}
                  amount={stakeAmount}
                  onApprovalConfirmed={() => {
                    toast.success("PSG tokens approved! You can now create your bet.");
                  }}
                >
                  🔐 Approve {stakeAmount} PSG to Create Bet
                </ApprovalButton>
              </div>
            )}

            {/* Show create bet button only when approval is done */}
            {!needsApproval && (
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
                  toast.success("Transaction sent! Creating your prediction bet...");
                }}
                onTransactionConfirmed={() => {
                  toast.success("Prediction bet created successfully! 🎯");
                  setSelectedMatchId(null);
                  setSelectedBetTypeId(null);
                  setStakeAmount("1");
                }}
                onError={(error) => {
                  toast.error(`Failed to create bet: ${error.message}`);
                }}
                disabled={!selectedMatchId || !selectedBetTypeId || !stakeAmount}
                className="w-full group relative overflow-hidden rounded-xl py-5 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  {selectedMatchId && selectedBetTypeId ? (
                    <>
                      <span className="text-xl">🚀</span>
                      <span>Create a Prediction Bet</span>
                    </>
                  ) : (
                    <span>Complete steps above to continue</span>
                  )}
                </div>
              </TransactionButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
