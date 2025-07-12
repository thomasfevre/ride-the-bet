interface InfluencerStats {
  rank: number;
  username: string;
  avatar: string;
  joinDate: string;
  winRate: number;
  totalBets: number;
  wins: number;
  losses: number;
  totalVolume: number;
  winnings: number;
  currentStreak: number;
  streakType: 'win' | 'loss';
}

// Mock data for the leaderboard
const mockInfluencers: InfluencerStats[] = [
  {
    rank: 1,
    username: '@cryptoking',
    avatar: '👑',
    joinDate: '2024-01-15',
    winRate: 78.5,
    totalBets: 127,
    wins: 100,
    losses: 27,
    totalVolume: 12450,
    winnings: 8920,
    currentStreak: 12,
    streakType: 'win'
  },
  {
    rank: 2,
    username: '@betmaster',
    avatar: '🎯',
    joinDate: '2024-02-03',
    winRate: 76.2,
    totalBets: 143,
    wins: 109,
    losses: 34,
    totalVolume: 15420,
    winnings: 10230,
    currentStreak: 8,
    streakType: 'win'
  },
  {
    rank: 3,
    username: '@predictor',
    avatar: '🔮',
    joinDate: '2024-01-28',
    winRate: 72.8,
    totalBets: 156,
    wins: 114,
    losses: 42,
    totalVolume: 8930,
    winnings: 6750,
    currentStreak: 5,
    streakType: 'win'
  },
  {
    rank: 4,
    username: '@sportsguru',
    avatar: '⚽',
    joinDate: '2024-03-10',
    winRate: 71.5,
    totalBets: 98,
    wins: 70,
    losses: 28,
    totalVolume: 11200,
    winnings: 7840,
    currentStreak: 3,
    streakType: 'loss'
  },
  {
    rank: 5,
    username: '@prophet',
    avatar: '🧙‍♂️',
    joinDate: '2024-02-18',
    winRate: 69.8,
    totalBets: 134,
    wins: 94,
    losses: 40,
    totalVolume: 9800,
    winnings: 6420,
    currentStreak: 15,
    streakType: 'win'
  },
  {
    rank: 6,
    username: '@psychic',
    avatar: '🌟',
    joinDate: '2024-03-22',
    winRate: 68.3,
    totalBets: 82,
    wins: 56,
    losses: 26,
    totalVolume: 7650,
    winnings: 4980,
    currentStreak: 2,
    streakType: 'win'
  },
  {
    rank: 7,
    username: '@oracle',
    avatar: '🎱',
    joinDate: '2024-01-05',
    winRate: 67.9,
    totalBets: 165,
    wins: 112,
    losses: 53,
    totalVolume: 13800,
    winnings: 8560,
    currentStreak: 4,
    streakType: 'loss'
  },
  {
    rank: 8,
    username: '@gambler',
    avatar: '🎲',
    joinDate: '2024-04-01',
    winRate: 65.4,
    totalBets: 78,
    wins: 51,
    losses: 27,
    totalVolume: 6420,
    winnings: 3890,
    currentStreak: 7,
    streakType: 'win'
  }
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return `#${rank}`;
  }
};

const getWinRateColor = (winRate: number) => {
  if (winRate >= 75) return 'text-green-600 dark:text-green-400';
  if (winRate >= 65) return 'text-blue-600 dark:text-blue-400';
  if (winRate >= 50) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

export default function Leaderboard() {
  const topPerformer = mockInfluencers[0];
  const highestVolume = mockInfluencers.reduce((prev, current) => 
    prev.totalVolume > current.totalVolume ? prev : current
  );
  const mostActive = mockInfluencers.reduce((prev, current) => 
    prev.totalBets > current.totalBets ? prev : current
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl">🏆</span>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          Influencer Leaderboard
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Top performers in the prediction game
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{topPerformer.avatar}</span>
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">🥇 Top Performer</p>
              <p className="font-bold text-yellow-900 dark:text-yellow-100">{topPerformer.username}</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">{topPerformer.winRate}% win rate</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{highestVolume.avatar}</span>
            <div>
              <p className="text-sm text-green-800 dark:text-green-200 font-medium">💰 Highest Volume</p>
              <p className="font-bold text-green-900 dark:text-green-100">{highestVolume.username}</p>
              <p className="text-xs text-green-700 dark:text-green-300">{highestVolume.totalVolume.toLocaleString()} PSG</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{mostActive.avatar}</span>
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">🔥 Most Active</p>
              <p className="font-bold text-blue-900 dark:text-blue-100">{mostActive.username}</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">{mostActive.totalBets} total bets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-card-dynamic border border-dynamic rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Influencer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Volume
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Streak
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockInfluencers.map((influencer) => (
                <tr key={influencer.rank} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg font-bold">
                        {getRankIcon(influencer.rank)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                        <span className="text-lg">{influencer.avatar}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {influencer.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Since {new Date(influencer.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <p className={`text-sm font-bold ${getWinRateColor(influencer.winRate)}`}>
                        {influencer.winRate}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {influencer.wins}W - {influencer.losses}L ({influencer.totalBets} total)
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {influencer.totalVolume.toLocaleString()} PSG
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        +{influencer.winnings.toLocaleString()} PSG won
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      influencer.streakType === 'win' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {influencer.streakType === 'win' ? '🔥' : '❄️'} {influencer.currentStreak}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
        <p>💡 Rankings update in real-time based on prediction performance</p>
        <p className="mt-1">Want to climb the leaderboard? Start making accurate predictions!</p>
      </div>
    </div>
  );
}
