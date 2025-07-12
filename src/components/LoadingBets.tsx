import { LoadingSpinner } from "./ui/LoadingSpinner";

export default function LoadingBets() {
  return (
    <div className="gradient-bg-dynamic  rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Active Prediction bets
      </h2>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32 mt-1"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center mt-6">
        <LoadingSpinner size="md" />
        <span className="ml-2 text-sm text-gray-500">Loading prediction bets...</span>
      </div>
    </div>
  );
}
