import { useReadContract, useActiveAccount, TransactionButton } from "thirdweb/react";
import { getContract, prepareContractCall, toWei } from "thirdweb";
import { client, spicyTestnet } from "../lib/thirdweb";
import { RIDETHEBET_ADDRESS, RIDETHEBET_ABI } from "../constants/contracts";
import { useState } from "react";
import toast from "react-hot-toast";
import { useBetCatalog } from "../hooks/useBetCatalog";
import { ApprovalButton, useTokenApproval } from "../hooks/useTokenApproval";

interface BetCardProps {
  betId: number;
}

const ridethebetContract = getContract({ 
  client, 
  chain: spicyTestnet, 
  address: RIDETHEBET_ADDRESS,
  abi: RIDETHEBET_ABI 
});

export default function BetCard({ betId }: BetCardProps) {
  const [voteAmount, setVoteAmount] = useState("1");
  const account = useActiveAccount();
  const { getBetDescription } = useBetCatalog();

  // Check approval status for voting
  const { needsApproval } = useTokenApproval({
    spenderAddress: RIDETHEBET_ADDRESS,
    amount: voteAmount
  });

  const { data: bet, isLoading } = useReadContract({
    contract: ridethebetContract,
    method: "bets",
    params: [BigInt(betId)]
  });

  const { data: betIdentifiers } = useReadContract({
    contract: ridethebetContract,
    method: "betIdentifiers", 
    params: [BigInt(betId)]
  });

  const { data: userUpvoteStake } = useReadContract({
    contract: ridethebetContract,
    method: "upvoterStakes",
    params: [BigInt(betId), account?.address || "0x0"]
  });

  const { data: userDownvoteStake } = useReadContract({
    contract: ridethebetContract,
    method: "downvoterStakes",
    params: [BigInt(betId), account?.address || "0x0"]
  });

  const { data: hasClaimed } = useReadContract({
    contract: ridethebetContract,
    method: "hasClaimed",
    params: [BigInt(betId), account?.address || "0x0"]
  });

  // Get influencer name using the influencer address from bet data
  const { data: influencerName } = useReadContract({
    contract: ridethebetContract,
    method: "influencerNames",
    params: [bet?.[0] || "0x0"] // bet[0] is the influencer address
  });

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-card-dynamic rounded-3xl"></div>;
  }

  if (!bet || !betIdentifiers) return null;

  const [influencer, , influencerStake, upvotePoolTotal, downvotePoolTotal, resolutionTimestamp, isResolved, influencerWasRight] = bet;
  const [matchId, betTypeId] = betIdentifiers;

  // Get human-readable description from bet catalog
  const description = getBetDescription(Number(matchId), Number(betTypeId));

  const resolutionDate = new Date(Number(resolutionTimestamp) * 1000);
  const isExpired = Date.now() > resolutionDate.getTime();
  const totalPool = Number(upvotePoolTotal) + Number(downvotePoolTotal);
  const upvotePercentage = totalPool > 0 ? (Number(upvotePoolTotal) / totalPool) * 100 : 50;

  const userVotedUp = userUpvoteStake && Number(userUpvoteStake) > 0;
  const userVotedDown = userDownvoteStake && Number(userDownvoteStake) > 0;
  const userVoted = userVotedUp || userVotedDown;

  const canClaim = isResolved && userVoted && !hasClaimed && 
    ((influencerWasRight && userVotedUp) || (!influencerWasRight && userVotedDown));

  const getStatusColor = () => {
    if (isResolved) return influencerWasRight ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    if (isExpired) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  const getStatusText = () => {
    if (isResolved) return influencerWasRight ? "✅ Correct" : "❌ Wrong";
    if (isExpired) return "⏰ Expired";
    return "🟢 Active";
  };

  return (
    <div className="bg-card-dynamic border border-dynamic rounded-3xl p-6 shadow-dynamic hover:shadow-hover-dynamic transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-dynamic-muted">#{betId}</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            {influencer.toLowerCase() === account?.address?.toLowerCase() && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-300">
                🏆 Your Prediction
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-dynamic">{description}</p>
          <p className="text-xs text-dynamic-muted mt-1">
            by {influencer.toLowerCase() === account?.address?.toLowerCase() ? 
              'You' : 
              (influencerName && influencerName.trim() !== '' ? 
                influencerName : 
                `${influencer.slice(0, 6)}...${influencer.slice(-4)}`
              )
            }
          </p>
              </div>
              <p className="text-bold text-dynamic-muted">
          Resolves: {resolutionDate.toLocaleDateString()} {resolutionDate.toLocaleTimeString()}
        </p>
      </div>

      {/* Pool Information */}
      <div className="mb-4">
        {/* Influencer's Initial Stake */}
        <div className="mb-8 bg-gradient-to-r from-primary-500/10 to-secondary-500/10  rounded-2xl">
          <div className="flex items-center justify-center mb-1">
            <span className="text-xs font-medium text-dynamic mx-2">
              💰Initial stake put down by the influencer :
            </span>
            <span className="text-xs font-bold text-dynamic">
              {(Number(influencerStake) / 10**18).toFixed(2)} PSG
            </span>
          </div>
          
        </div>

        {/* Community Voting Pools */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-dynamic-secondary mb-2">
            <span>💪 Total Supporters <strong>({((Number(upvotePoolTotal) - Number(influencerStake)) / 10**18).toFixed(2)} PSG)</strong></span>
            <span>🚫 Total Doubters <strong>({(Number(downvotePoolTotal) / 10**18).toFixed(2)} PSG)</strong></span>
          </div>
        </div>

        <div className="w-full bg-dynamic-secondary/20 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-success-500 to-primary-500 h-3 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${upvotePercentage}%` }}
          ></div>
        </div>
        
      </div>

      {/* User's Stake Info */}
      {typeof userVoted === 'number' && Number(userVoted) > 0 &&(
        <div className="mb-4 p-3 bg-card-dynamic border border-dynamic rounded-2xl text-xs">
          <span className="font-medium text-dynamic">Your stake: </span>
          <span className="text-dynamic-secondary">
            {userVotedUp && `${(Number(userUpvoteStake) / 10**18).toFixed(2)} PSG (Supporting)`}
            {userVotedDown && `${(Number(userDownvoteStake) / 10**18).toFixed(2)} PSG (Doubting)`}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      {!isResolved && !isExpired && account && !userVoted && (
        <div className="space-y-3 mb-3">
          {/* Stake Amount Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stake Amount (PSG)
            </label>
            <input
              type="number"
              value={voteAmount}
              onChange={(e) => setVoteAmount(e.target.value)}
              placeholder="Amount"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0.1"
              step="0.1"
            />
          </div>

          {/* Show approval button when approval is needed */}
          {needsApproval && (
            <div className="space-y-2 mt-10 flex flex-col items-center justify-center">
              <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
                💡 First approve PSG tokens, then you can vote on this prediction
              </div>
              <ApprovalButton
                spenderAddress={RIDETHEBET_ADDRESS}
                amount={voteAmount}
                onApprovalConfirmed={() => {
                  toast.success("PSG tokens approved! You can now vote.");
                }}
                className="text-xs py-2"
              >
                🔐 Approve {voteAmount} PSG to Vote
              </ApprovalButton>
            </div>
          )}

          {/* Show voting buttons only when approval is done */}
          {!needsApproval && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              <TransactionButton
                transaction={() => {
                  const amount = toWei(voteAmount);
                  return prepareContractCall({
                    contract: ridethebetContract,
                    method: "upvote",
                    params: [BigInt(betId), amount],
                  });
                }}
                onTransactionSent={(result) => {
                  console.log("Transaction submitted", result.transactionHash);
                  toast.loading("Supporting prediction...", { id: "support" });
                }}
                onTransactionConfirmed={(result) => {
                  console.log("Transaction confirmed", result.transactionHash);
                  toast.success("Successfully supported the prediction!", { id: "support" });
                }}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 text-xs py-2 px-2 rounded-lg disabled:opacity-50 transition-all duration-200 hover:scale-105 dark:from-white dark:to-gray-100 dark:text-gray-900 dark:hover:from-gray-100 dark:hover:to-gray-200"
              >
                🔥 Support
              </TransactionButton>
              
              <TransactionButton
                transaction={() => {
                  const amount = toWei(voteAmount);
                  return prepareContractCall({
                    contract: ridethebetContract,
                    method: "downvote",
                    params: [BigInt(betId), amount],
                  });
                }}
                onTransactionSent={(result) => {
                  console.log("Transaction submitted", result.transactionHash);
                  toast.loading("Doubting prediction...", { id: "doubt" });
                }}
                onTransactionConfirmed={(result) => {
                  console.log("Transaction confirmed", result.transactionHash);
                  toast.success("Successfully doubted the prediction!", { id: "doubt" });
                }}
                className="w-full bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs py-2 px-2 rounded-lg disabled:opacity-50 transition-all duration-200 hover:scale-105 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800/20"
              >
                🚫 Doubt
              </TransactionButton>
            </div>
          )}
        </div>
      )}

      {/* Claim Winnings Button */}
      {canClaim && (
        <TransactionButton
          transaction={() => prepareContractCall({
            contract: ridethebetContract,
            method: "claimWinnings",
            params: [BigInt(betId)],
          })}
          onTransactionSent={(result) => {
            console.log("Claim transaction submitted", result.transactionHash);
          }}
          onTransactionConfirmed={(result) => {
            console.log("Claim transaction confirmed", result.transactionHash);
          }}
          className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 text-sm py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 dark:from-white dark:to-gray-100 dark:text-gray-900 dark:hover:from-gray-100 dark:hover:to-gray-200"
        >
          🎉 Claim Winnings
        </TransactionButton>
      )}

      {/* Admin Resolution (if owner) */}
      {!isResolved && isExpired && account && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          <TransactionButton
            transaction={() => prepareContractCall({
              contract: ridethebetContract,
              method: "resolveBet",
              params: [BigInt(betId), true],
            })}
            className="bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 text-xs py-1 px-2 rounded-lg transition-all duration-200 hover:scale-105 dark:from-white dark:to-gray-100 dark:text-gray-900 dark:hover:from-gray-100 dark:hover:to-gray-200"
          >
            Resolve: Correct
          </TransactionButton>
          <TransactionButton
            transaction={() => prepareContractCall({
              contract: ridethebetContract,
              method: "resolveBet",
              params: [BigInt(betId), false],
            })}
            className="bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs py-1 px-2 rounded-lg transition-all duration-200 hover:scale-105 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800/20"
          >
            Resolve: Wrong
          </TransactionButton>
        </div>
      )}
    </div>
  );
}
