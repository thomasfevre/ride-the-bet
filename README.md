# ⚡️ Ride The Bet - Prediction bets dApp  

Live at : https://ride-the-bet.vercel.app/  
Project Demo Video on Devfolio : https://devfolio.co/projects/ridethebet-b84a

A decentralized prediction market built on Chiliz Spicy Testnet where users can create prediction bets, stake tokens on outcomes, and earn from correct predictions.

## 🎯 Features

- **Create Prediction Bets**: Make predictions and stake PSG tokens
- **Vote on Predictions**: Support or doubt predictions by staking tokens
- **Token Approval System**: Secure ERC20 token approval before transactions
- **Influencer Registration**: Register unique pseudonyms for brand identity
- **Leaderboard System**: Track top performers with detailed statistics
- **Earn Rewards**: Winners share the losing side's stake proportionally
- **Admin Resolution**: Contract admins resolve predictions after deadlines
- **Real-time Updates**: Live tracking of pools and voting activity
- **Dark Mode Support**: Toggle between light and dark themes

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Blockchain**: Chiliz Spicy Testnet
- **Web3 SDK**: ThirdWeb
- **Smart Contracts**: Solidity

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js (v18 or higher)
- MetaMask or compatible Web3 wallet
- Chiliz Spicy Testnet configured in your wallet

### Chiliz Spicy Testnet Configuration

Add this network to your MetaMask:

- **Network Name**: Chiliz Spicy Testnet
- **RPC URL**: `https://spicy-rpc.chiliz.com/`
- **Chain ID**: `88882`
- **Symbol**: `CHZ`
- **Block Explorer**: `https://testnet.chiliscan.com`

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd ride-the-bet
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_THIRDWEB_CLIENT_ID="your_thirdweb_client_id"
```

Get your Client ID from [ThirdWeb Dashboard](https://thirdweb.com/dashboard).

### 3. Deploy Smart Contracts

#### Deploy MockPSG Token Contract

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create `MockPSG.sol` with the provided contract code
3. Compile with Solidity 0.8.20
4. Deploy to Chiliz Spicy Testnet with your address as `initialOwner`
5. Copy the deployed contract address

#### Deploy RideTheBet Contract

1. Create `rideTheBet.sol` in Remix
2. Compile with Solidity 0.8.20
3. Deploy with parameters:
   - `_initialMinimumStake`: `1000000000000000000` (1 PSG)
   - `initialOwner`: Your wallet address
4. Copy the deployed contract address

### 4. Update Contract Addresses

Edit `src/constants/contracts.ts`:

```typescript
export const RIDETHEBET_ADDRESS = "0xYourRideTheBetAddress";
export const MOCK_PSG_ADDRESS = "0xYourMockPSGAddress";
```

### 5. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see your dApp!

## 🎮 How to Use

### For Users

1. **Connect Wallet**: Click "Connect Wallet" and connect to Chiliz Spicy Testnet
2. **Get PSG Tokens**: Ask the contract owner to mint tokens for you
3. **Register as Influencer**: (Optional) Register a unique pseudonym for your predictions
4. **Create Predictions**: Use the "Create Bet" button in the header
5. **Approve Tokens**: First approve PSG tokens before creating bets or voting
6. **Vote on Predictions**: Support or doubt predictions by staking tokens
7. **View Leaderboard**: Check top performers via the "🏆 Leaderboard" button
8. **Claim Winnings**: After resolution, claim your share if you voted correctly

### For Admins

1. **Mint Tokens**: Use the Admin Panel to mint PSG tokens for users
2. **Resolve Bets**: After deadline, resolve predictions as correct or incorrect
3. **Monitor Activity**: Track all prediction bets and user activity

## 📱 User Interface

### Main Components

- **Header**: Wallet connection, Create Bet, and Leaderboard buttons
- **Wallet Info**: Current address and token balances
- **Admin Panel**: Token minting and admin functions (admin only)
- **Create Bet Modal**: Form to create new prediction bets with token approval
- **Bet List**: All active and resolved prediction bets
- **Bet Cards**: Individual prediction details with approval workflow and voting interface
- **Leaderboard Modal**: Influencer rankings and performance statistics
- **Dark Mode Toggle**: Theme switching functionality

### Key Features

- **Real-time Balance Updates**: Live PSG and CHZ balance display
- **Token Approval Workflow**: Secure two-step process for all transactions
- **Influencer Identity System**: Pseudonym registration and display
- **Progress Bars**: Visual representation of voting pools with influencer stake separation
- **Status Indicators**: Active, expired, and resolved bet status
- **Transaction Buttons**: One-click ThirdWeb transaction handling
- **Responsive Design**: Works on desktop and mobile devices
- **Modal System**: Clean overlay interfaces for key actions
- **Leaderboard Gamification**: Performance tracking and competitive rankings

## 🏗 Smart Contract Architecture

### MockPSG.sol
- ERC20 token contract
- Mintable by owner
- Used for staking in prediction bets

### rideTheBet.sol
- Main prediction market contract
- Handles bet creation, voting, and resolution
- Manages stake pools and winner calculations
- Supports influencer registration with pseudonyms
- Separates influencer stakes from community voting pools
- Implements secure token approval patterns

## 🔧 Development

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (Button, Modal, LoadingSpinner)
│   ├── BetList.tsx     # List of all bets with loading states
│   ├── BetCard.tsx     # Individual bet display with approval workflow
│   ├── CreateBet.tsx   # Bet creation form with token approval
│   ├── Leaderboard.tsx # Influencer rankings and statistics
│   ├── WalletInfo.tsx  # User wallet information and balances
│   ├── AdminPanel.tsx  # Admin functions and token minting
│   ├── DarkModeToggle.tsx # Theme switching component
│   └── Footer.tsx      # App footer
├── hooks/              # Custom React hooks
│   ├── useBetCatalog.tsx  # Bet data management
│   └── useTokenApproval.tsx # ERC20 token approval logic
├── constants/          # Contract addresses and ABIs
├── lib/               # ThirdWeb configuration
└── App.tsx           # Main application component with modal management
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

### Common Issues

1. **"Cannot connect to network"**
   - Ensure Chiliz Spicy Testnet is properly configured
   - Check RPC URL and chain ID

2. **"Insufficient funds"**
   - Get CHZ from a testnet faucet
   - Ask admin to mint PSG tokens

3. **"Transaction failed"**
   - Check token approvals first - all transactions require PSG token approval
   - Ensure sufficient gas (CHZ) balance
   - Verify you're not trying to vote twice on the same prediction

4. **"Approval required" message**
   - This is normal - first approve PSG tokens, then perform the action
   - Each new amount requires separate approval for security

5. **Contract not found**
   - Verify contract addresses in `constants/contracts.ts`
   - Ensure contracts are deployed on correct network

6. **"Name already taken" when registering**
   - Try a different pseudonym for your influencer identity
   - Names must be unique across the platform

## 🎪 Demo Flow

1. Deploy contracts on Chiliz Spicy Testnet
2. Update contract addresses in the app
3. Start the development server
4. Connect MetaMask to Chiliz Spicy Testnet
5. Mint PSG tokens for testing addresses
6. **Register as influencer** with a unique pseudonym (optional)
7. **Create a prediction bet** (requires PSG token approval first)
8. **Vote on predictions** with different accounts (each requires approval)
9. **Check leaderboard** to see influencer rankings
10. Wait for deadline or manually advance time
11. **Resolve the prediction** as admin
12. **Claim winnings** as the winning voters

## 🆕 Latest Updates

### v2.0 Features Added:
- **🔐 Token Approval System**: Secure ERC20 approval workflow before all transactions
- **👤 Influencer Registration**: Users can register unique pseudonyms for branding
- **🏆 Leaderboard**: Complete gamification system with influencer rankings and statistics
- **💰 Stake Separation**: Clear distinction between influencer initial stakes and community support
- **🎨 Enhanced UI**: Improved bet cards with better visual hierarchy and information display
- **🌙 Dark Mode**: Complete dark/light theme support throughout the application
- **📱 Modal System**: Clean overlay interfaces for bet creation and leaderboard viewing

## 📄 License

This project is built for the Chiliz Hackathon and is for educational/demonstration purposes.

## 🚨 Important Notes

- This is a TESTNET application with no real monetary value
- PSG tokens are mock tokens for demonstration only
- **All transactions require token approval first** for security
- Influencer pseudonyms must be unique platform-wide
- Always verify contract addresses before interacting
- Keep your private keys secure and never share them
- The leaderboard shows mock data for demonstration purposes

## 🤝 Contributing

This project was built for the Chiliz Hackathon. Feel free to fork and improve upon it!

---

Built with ❤️ for the Chiliz Community
