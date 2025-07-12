import { useReadContract, useActiveAccount, TransactionButton } from "thirdweb/react";
import { getContract, prepareContractCall, toWei } from "thirdweb";
import { client, spicyTestnet } from "../lib/thirdweb";
import { RIDETHEBET_ADDRESS, RIDETHEBET_ABI } from "../constants/contracts";
import { useState } from "react";
import toast from "react-hot-toast";

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

  const { data: bet, isLoading } = useReadContract({
    contract: ridethebetContract,
    method: "bets",
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

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>;
  }

  if (!bet) return null;

  const [influencer, description, , upvotePoolTotal, downvotePoolTotal, resolutionTimestamp, isResolved, influencerWasRight] = bet;

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
    return "🔴 Active";
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500">#{betId}</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900">{description}</p>
          <p className="text-xs text-gray-500 mt-1">
            by {influencer.slice(0, 6)}...{influencer.slice(-4)}
          </p>
        </div>
      </div>

      {/* Pool Information */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Supporters ({(Number(upvotePoolTotal) / 10**18).toFixed(2)} PSG)</span>
          <span>Doubters ({(Number(downvotePoolTotal) / 10**18).toFixed(2)} PSG)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${upvotePercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Resolves: {resolutionDate.toLocaleDateString()} {resolutionDate.toLocaleTimeString()}
        </p>
      </div>

      {/* User's Stake Info */}
      {userVoted && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
          <span className="font-medium">Your stake: </span>
          {userVotedUp && `${(Number(userUpvoteStake) / 10**18).toFixed(2)} PSG (Supporting)`}
          {userVotedDown && `${(Number(userDownvoteStake) / 10**18).toFixed(2)} PSG (Doubting)`}
        </div>
      )}

      {/* Action Buttons */}
      {!isResolved && !isExpired && account && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="space-y-2">
            <input
              type="number"
              value={voteAmount}
              onChange={(e) => setVoteAmount(e.target.value)}
              placeholder="Amount"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              min="0.1"
              step="0.1"
            />
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
              className="w-full bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded disabled:opacity-50"
            >
              🔥 Support
            </TransactionButton>
          </div>
          
          <div className="space-y-2">
            <input
              type="number"
              value={voteAmount}
              onChange={(e) => setVoteAmount(e.target.value)}
              placeholder="Amount"
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              min="0.1"
              step="0.1"
            />
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
              className="w-full bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded disabled:opacity-50"
            >
              🚫 Doubt
            </TransactionButton>
          </div>
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
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-2 px-4 rounded font-medium"
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
            className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded"
          >
            Resolve: Correct
          </TransactionButton>
          <TransactionButton
            transaction={() => prepareContractCall({
              contract: ridethebetContract,
              method: "resolveBet",
              params: [BigInt(betId), false],
            })}
            className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded"
          >
            Resolve: Wrong
          </TransactionButton>
        </div>
      )}
    </div>
  );
}
