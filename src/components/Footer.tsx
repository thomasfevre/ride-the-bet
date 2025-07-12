export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">About Ride The Bet</h3>
            <p className="text-sm text-gray-600">
              A decentralized prediction market built on Chiliz Spicy Testnet. 
              Create predictions, stake tokens, and win from the wisdom of the crowd.
            </p>
          </div>

          {/* How It Works */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">How It Works</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Create a prediction and stake PSG tokens</li>
              <li>• Others vote by staking on outcomes</li>
              <li>• Winners share the losing side's stake</li>
              <li>• Admins resolve predictions after deadline</li>
            </ul>
          </div>

          {/* Technical Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Built With</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Chiliz Spicy Testnet</li>
              <li>• ThirdWeb SDK</li>
              <li>• React + TypeScript</li>
              <li>• Tailwind CSS</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            Built for the Chiliz Hackathon 2025 | Testnet Only - No Real Value
          </p>
        </div>
      </div>
    </footer>
  );
}
