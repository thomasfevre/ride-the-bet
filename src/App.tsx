import { ConnectButton } from "thirdweb/react";
import { Toaster } from "react-hot-toast";
import { client, spicyTestnet } from "./lib/thirdweb";
import BetList from "./components/BetList";
import CreateBet from "./components/CreateBet";
import WalletInfo from "./components/WalletInfo";
import AdminPanel from "./components/AdminPanel";
import Footer from "./components/Footer";
import DarkModeToggle from "./components/DarkModeToggle";
import { BetCatalogProvider } from "./hooks/useBetCatalog";

function App() {
  return (
    <BetCatalogProvider>
      <div className="min-h-screen gradient-bg-dynamic transition-all duration-500">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card-dynamic border-b border-dynamic shadow-dynamic">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center animate-float shadow-lg">
                    <span className="text-xl">🏆</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold gradient-text">
                      Ride The Bet
                    </h1>
                    <span className="text-xs text-dynamic-muted">
                      Prediction Duels
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <DarkModeToggle />
                <ConnectButton 
                  client={client} 
                  chains={[spicyTestnet]}
                  theme="dark"
                  connectButton={{
                    className: "!bg-gradient-to-r !from-primary-500 !to-secondary-500 !text-white !font-semibold !px-6 !py-2 !rounded-2xl !border-0 hover:!shadow-glow !transition-all !duration-300 hover:!scale-105"
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-accent-500/10 dark:from-primary-400/20 dark:via-secondary-400/20 dark:to-accent-400/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h2 className="text-4xl font-bold gradient-text mb-4 animate-slide-in">
                Welcome to the Future of Predictions
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-slide-in">
                Create, vote, and win with decentralized prediction markets on Chiliz Spicy Testnet
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Bet Section */}
            <div className="lg:col-span-1 space-y-6">
              <WalletInfo />
              <AdminPanel />
              <CreateBet />
            </div>
            
            {/* Bet List Section */}
            <div className="lg:col-span-2">
              <BetList />
            </div>
          </div>
        </main>

        <Footer />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            className: "!bg-white !dark:bg-gray-800 !text-gray-900 !dark:text-white !border !border-gray-200 !dark:border-gray-700 !rounded-2xl !shadow-hover",
            duration: 4000,
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </div>
    </BetCatalogProvider>
  );
}

export default App;
