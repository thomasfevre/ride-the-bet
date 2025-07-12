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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Active Prediction Duels
        </h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🎯</div>
          <p className="text-gray-500">No prediction duels yet. Be the first to create one!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Active Prediction Duels ({Number(betCount)})
      </h2>
      <div className="space-y-4">
        {betIds.map((betId) => (
          <BetCard key={betId} betId={betId} />
        ))}
      </div>
    </div>
  );
}
