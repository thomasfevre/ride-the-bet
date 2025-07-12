import { ConnectButton } from "thirdweb/react";
import { Toaster } from "react-hot-toast";
import { client, spicyTestnet } from "./lib/thirdweb";
import BetList from "./components/BetList";
import CreateBet from "./components/CreateBet";
import WalletInfo from "./components/WalletInfo";
import AdminPanel from "./components/AdminPanel";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                🏆 Ride The Bet
              </h1>
              <span className="ml-2 text-sm text-gray-500">
                Prediction Duels
              </span>
            </div>
            <ConnectButton 
              client={client} 
              chains={[spicyTestnet]}
              theme="light"
            />
          </div>
        </div>
      </header>

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
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;
