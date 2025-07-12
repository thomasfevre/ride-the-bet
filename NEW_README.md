# 🏆 Ride The Bet - Prediction Duels dApp

A decentralized prediction market built on Chiliz Spicy Testnet where users can create prediction duels, stake tokens on outcomes, and earn from correct predictions.

## 🎯 Features

- **Create Prediction Duels**: Make predictions and stake PSG tokens
- **Vote on Predictions**: Support or doubt predictions by staking tokens
- **Earn Rewards**: Winners share the losing side's stake proportionally
- **Admin Resolution**: Contract admins resolve predictions after deadlines
- **Real-time Updates**: Live tracking of pools and voting activity

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
3. **Create Predictions**: Use the "Create Prediction Duel" form
4. **Vote on Predictions**: Support or doubt predictions by staking tokens
5. **Claim Winnings**: After resolution, claim your share if you voted correctly

### For Admins

1. **Mint Tokens**: Use the Admin Panel to mint PSG tokens for users
2. **Resolve Bets**: After deadline, resolve predictions as correct or incorrect
3. **Monitor Activity**: Track all prediction duels and user activity

## 📱 User Interface

### Main Components

- **Header**: Wallet connection and branding
- **Wallet Info**: Current address and token balances
- **Admin Panel**: Token minting and admin functions (admin only)
- **Create Bet**: Form to create new prediction duels
- **Bet List**: All active and resolved prediction duels
- **Bet Cards**: Individual prediction details and voting interface

### Key Features

- **Real-time Balance Updates**: Live PSG and CHZ balance display
- **Progress Bars**: Visual representation of voting pools
- **Status Indicators**: Active, expired, and resolved bet status
- **Transaction Buttons**: One-click ThirdWeb transaction handling
- **Responsive Design**: Works on desktop and mobile devices

## 🏗 Smart Contract Architecture

### MockPSG.sol
- ERC20 token contract
- Mintable by owner
- Used for staking in prediction duels

### rideTheBet.sol
- Main prediction market contract
- Handles bet creation, voting, and resolution
- Manages stake pools and winner calculations

## 🔧 Development

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── BetList.tsx     # List of all bets
│   ├── BetCard.tsx     # Individual bet display
│   ├── CreateBet.tsx   # Bet creation form
│   ├── WalletInfo.tsx  # User wallet information
│   ├── AdminPanel.tsx  # Admin functions
│   └── Footer.tsx      # App footer
├── constants/          # Contract addresses and ABIs
├── lib/               # ThirdWeb configuration
└── App.tsx           # Main application component
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
   - Check token approvals
   - Ensure sufficient gas (CHZ) balance

4. **Contract not found**
   - Verify contract addresses in `constants/contracts.ts`
   - Ensure contracts are deployed on correct network

## 🎪 Demo Flow

1. Deploy contracts on Chiliz Spicy Testnet
2. Update contract addresses in the app
3. Start the development server
4. Connect MetaMask to Chiliz Spicy Testnet
5. Mint PSG tokens for testing addresses
6. Create a prediction duel
7. Vote on the prediction with different accounts
8. Wait for deadline or manually advance time
9. Resolve the prediction as admin
10. Claim winnings as the winning voters

## 📄 License

This project is built for the Chiliz Hackathon and is for educational/demonstration purposes.

## 🚨 Important Notes

- This is a TESTNET application with no real monetary value
- PSG tokens are mock tokens for demonstration only
- Always verify contract addresses before interacting
- Keep your private keys secure and never share them

## 🤝 Contributing

This project was built for the Chiliz Hackathon. Feel free to fork and improve upon it!

---

Built with ❤️ for the Chiliz Community
