import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { client, spicyTestnet } from "../lib/thirdweb";
import { RIDETHEBET_ADDRESS, RIDETHEBET_ABI } from "../constants/contracts";
import BetCard from "./BetCard";
import LoadingBets from "./LoadingBets";

const contract = getContract({ 
  client, 
  chain: spicyTestnet, 
  address: RIDETHEBET_ADDRESS,
  abi: RIDETHEBET_ABI 
});

export default function BetList() {
  const { data: betCount, isLoading: isLoadingCount } = useReadContract({
    contract,
    method: "getBetCount",
    params: []
  });

  // Create an array of bet IDs to fetch individual bet data
  const betIds = betCount ? Array.from({ length: Number(betCount) }, (_, i) => i) : [];

  if (isLoadingCount) {
    return <LoadingBets />;
  }

  if (!betCount || Number(betCount) === 0) {
    return (
      <div className="bg-card-dynamic border border-dynamic rounded-3xl shadow-dynamic p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-accent-500 to-primary-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-sm">🎯</span>
          </div>
          <h2 className="text-lg font-bold text-dynamic">
            Active Prediction Duels
          </h2>
        </div>
        <div className="text-center py-12">
          <div className="text-6xl mb-6 animate-float">🎯</div>
          <h3 className="text-xl font-bold text-dynamic mb-2">No duels yet!</h3>
          <p className="text-dynamic-secondary font-medium">Be the first to create a prediction duel and start earning!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-accent-500 to-primary-500 rounded-xl flex items-center justify-center">
          <span className="text-white text-sm">🎯</span>
        </div>
        <h2 className="text-xl font-bold gradient-text">
          Active Prediction Duels ({Number(betCount)})
        </h2>
      </div>
      <div className="space-y-6">
        {betIds.map((betId) => (
          <BetCard key={betId} betId={betId} />
        ))}
      </div>
    </div>
  );
}
