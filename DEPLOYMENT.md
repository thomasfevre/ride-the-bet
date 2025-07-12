# 🚀 Quick Deployment Guide

## Step 1: Get ThirdWeb Client ID

1. Go to [ThirdWeb Dashboard](https://thirdweb.com/dashboard)
2. Create an account or sign in
3. Create a new project
4. Copy your Client ID

## Step 2: Configure Environment

Update `.env` file:
```env
VITE_THIRDWEB_CLIENT_ID="paste_your_client_id_here"
```

## Step 3: Add Chiliz Spicy Testnet to MetaMask

Network Details:
- **Network Name**: Chiliz Spicy Testnet
- **RPC URL**: `https://spicy-rpc.chiliz.com/`
- **Chain ID**: `88882`
- **Symbol**: `CHZ`
- **Block Explorer**: `https://testnet.chiliscan.com`

## Step 4: Deploy Smart Contracts

### Using Remix IDE (Recommended)

1. Open [Remix IDE](https://remix.ethereum.org)

2. **Deploy MockPSG.sol**:
   - Create new file `MockPSG.sol`
   - Copy contract code from `docs/mockPSG.json` or write ERC20 with mint function
   - Compile with Solidity 0.8.20
   - Deploy with your address as `initialOwner`
   - **Save the contract address**

3. **Deploy rideTheBet.sol**:
   - Create new file `rideTheBet.sol`
   - Copy contract code (create based on ABI in `docs/rideTheBet.json`)
   - Deploy with parameters:
     - `_initialMinimumStake`: `1000000000000000000` (1 PSG token)
     - `initialOwner`: Your wallet address
   - **Save the contract address**

## Step 5: Update Contract Addresses

Edit `src/constants/contracts.ts`:

```typescript
export const RIDETHEBET_ADDRESS = "0xYourDeployedRideTheBetAddress";
export const MOCK_PSG_ADDRESS = "0xYourDeployedMockPSGAddress";
```

## Step 6: Test the Application

```bash
npm run dev
```

## Step 7: Test Flow

1. Connect wallet to Chiliz Spicy Testnet
2. Mint PSG tokens using Admin Panel
3. Create a prediction bet
4. Vote on predictions
5. Resolve bets after deadline
6. Claim winnings

## 🎯 Contract Addresses to Update

**IMPORTANT**: Replace these placeholder addresses in `src/constants/contracts.ts`:

```typescript
// REPLACE THESE WITH YOUR DEPLOYED ADDRESSES
export const RIDETHEBET_ADDRESS = "0x..."; // ← Your RideTheBet contract
export const MOCK_PSG_ADDRESS = "0x...";   // ← Your MockPSG contract
```

## 🔧 Troubleshooting

- **App loads but "Connect Wallet" doesn't work**: Check ThirdWeb Client ID
- **Can't see contract data**: Verify contract addresses are correct
- **Transactions fail**: Ensure you have CHZ for gas and PSG tokens for betting
- **Can't create bets**: Make sure you have PSG tokens and are the contract owner

---

🎪 **Ready to demo!** Your Prediction bets dApp should be fully functional.
