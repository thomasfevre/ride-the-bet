export default function Footer() {
  return (
    <footer className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="mr-2">🏆</span>
              About Ride The Bet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              A decentralized prediction market built on Chiliz Spicy Testnet. 
              Create predictions, stake tokens, and win from the wisdom of the crowd.
            </p>
          </div>

          {/* How It Works */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              How It Works
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start">
                <span className="text-primary-500 mr-2">•</span>
                Create a prediction and stake PSG tokens
              </li>
              <li className="flex items-start">
                <span className="text-secondary-500 mr-2">•</span>
                Others vote by staking on outcomes
              </li>
              <li className="flex items-start">
                <span className="text-accent-500 mr-2">•</span>
                Winners share the losing side's stake
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">•</span>
                Admins resolve predictions after deadline
              </li>
            </ul>
          </div>

          {/* Technical Info */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="mr-2">🔧</span>
              Built With
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Chiliz Spicy Testnet
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                ThirdWeb SDK
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                React + TypeScript
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Tailwind CSS
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
            Built for the Chiliz Hackathon 2025 | Testnet Only - No Real Value
          </p>
        </div>
      </div>
    </footer>
  );
}
