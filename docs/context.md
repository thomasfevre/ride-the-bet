# "Ride The Bet" Prediction Duel dApp: Development Plan

This document outlines the step-by-step plan to build, test, and deploy the "Ride The Bet" decentralized application for the Chiliz Hackathon.

**Tech Stack:**
- **Framework:** React (with Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Web3 SDK:** Thirdweb
- **Blockchain:** Chiliz Spicy Testnet

---

## Phase 1: Project Setup & Foundation (1-2 Hours)

**Goal:** Create a clean, structured project with all necessary tools installed and configured.

1.  **Initialize Vite Project:**
    - Open your terminal and run the Thirdweb CLI to create a new project with a pre-configured template. This is the fastest way to get started.
    ```bash
    npx thirdweb create app --template vite-ts
    ```
    - When prompted, name your project (e.g., `ride-the-bet`).

2.  **Install Dependencies:**
    - Navigate into your new project directory.
    - The Thirdweb template includes the core dependencies. Install a UI library for speed. We'll use **shadcn/ui** for its modern look and ease of use.
    ```bash
    cd ride-the-bet
    npm install
    ```
    - Initialize Tailwind CSS (Vite templates from Thirdweb usually include this).
    - Initialize shadcn/ui:
    ```bash
    npx shadcn-ui@latest init
    ```
    - Follow the prompts. Choose the default options.

3.  **Project Structure & Cleanup:**
    - Open the project in VS Code.
    - In the `src` folder, remove the default boilerplate content from `App.tsx` and `App.css`.
    - Create the following folder structure inside `src/`:
        - `components/`: For reusable UI components (e.g., Header, BetCard).
        - `constants/`: For contract addresses and ABI files.
        - `lib/`: For helper functions and Thirdweb client configuration.

4.  **Environment Variables:**
    - Create a `.env` file in the root of your project.
    - Go to the [Thirdweb Dashboard](https://thirdweb.com/dashboard), create a new project, and get your **Client ID**.
    - Add the Client ID to your `.env` file:
    ```
    VITE_THIRDWEB_CLIENT_ID="YOUR_CLIENT_ID_HERE"
    ```

---

## Phase 2: Smart Contract Deployment (1 Hour)

**Goal:** Get your `MockPSG.sol` and `rideTheBet.sol` contracts live on the Chiliz Spicy Testnet.

1.  **Compile Contracts:**
    - Use a tool like Remix IDE for speed.
    - Copy/paste the code for `MockPSG.sol` into Remix.
    - Compile it using compiler version `0.8.20`.

2.  **Deploy `MockPSG.sol`:**
    - In Remix, switch the environment to "Injected Provider - MetaMask". Ensure MetaMask is connected to the **Chiliz Spicy Testnet**.
    - In the "Deploy" tab, select the `MockPSG` contract. For the `initialOwner` argument in the constructor, paste your own wallet address.
    - Click "Deploy" and confirm the transaction in MetaMask.
    - **Crucially, copy the deployed contract address.**

3.  **Deploy `rideTheBet.sol`:**
    - Copy/paste the code for `rideTheBet.sol` into Remix and compile it.
    - In the "Deploy" tab, select the `rideTheBet` contract.
    - Fill in the constructor arguments:
        - `_initialMinimumStake`: Set a reasonable amount, e.g., `1000000000000000000` (for 1 token, since decimals are 18).
        - `initialOwner`: Paste your own wallet address.
    - Click "Deploy" and confirm.
    - **Copy the deployed contract address and the contract's ABI.**

4.  **Store Addresses and ABIs:**
    - In your `src/constants/` folder, create a new file `contracts.ts`.
    - Add the deployed addresses and ABIs to this file.
    ```typescript
    // src/constants/contracts.ts
    export const RIDETHEBET_ADDRESS = "0xYourrideTheBetAddress";
    export const MOCK_PSG_ADDRESS = "0xYourMockPSGAddress";
    export const RIDETHEBET_DUEL_ABI = [/* Paste ABI here */];
    ```

---

## Phase 3: Thirdweb & dApp Core Logic (2-3 Hours)

**Goal:** Connect the frontend to the blockchain and enable core wallet interactions.

1.  **Configure Thirdweb Client & Chains:**
    - Create a file `src/lib/thirdweb.ts`.
    - Define the Chiliz Spicy testnet and create your Thirdweb client.
    ```typescript
    // src/lib/thirdweb.ts
    import { createThirdwebClient } from "thirdweb";
    import { defineChain } from "thirdweb/chains";

    export const client = createThirdwebClient({
      clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
    });

    export const spicyTestnet = defineChain({
      id: 88882,
      name: "Chiliz Spicy Testnet",
      nativeCurrency: { name: "CHZ", symbol: "CHZ", decimals: 18 },
      rpcUrls: ["[https://spicy-rpc.chiliz.com/](https://spicy-rpc.chiliz.com/)"],
    });
    ```

2.  **Wrap App in `ThirdwebProvider`:**
    - In your main entry file (`src/main.tsx`), wrap your entire application.
    ```typescript
    // src/main.tsx
    import React from "react";
    import ReactDOM from "react-dom/client";
    import { ThirdwebProvider } from "thirdweb/react";
    import App from "./App";
    import "./index.css";

    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <ThirdwebProvider>
          <App />
        </ThirdwebProvider>
      </React.StrictMode>
    );
    ```

3.  **Create the `ConnectButton` Component:**
    - In `App.tsx`, add the Thirdweb `ConnectButton` to handle all wallet connection logic.
    ```typescript
    // src/App.tsx
    import { ConnectButton } from "thirdweb/react";
    import { client, spicyTestnet } from "./lib/thirdweb";

    function App() {
      return (
        <div className="p-4">
          <header className="flex justify-end">
            <ConnectButton client={client} chains={[spicyTestnet]} />
          </header>
          <main>
            {/* Main dApp content will go here */}
          </main>
        </div>
      );
    }
    export default App;
    ```
    - **Milestone:** Run `npm run dev`. You should see a webpage with a "Connect Wallet" button that works.

---

## Phase 4: Building the UI & Contract Interactions (4-6 Hours)

**Goal:** Build the components to display bets, create bets, and vote on them.

1.  **`BetCard` Component:**
    - Create a component `src/components/BetCard.tsx`.
    - This component will display the details of a single prediction duel: description, pools, and buttons to vote.
    - It will take a `bet` object as a prop.

2.  **`BetList` Component (Reading Data):**
    - Create `src/components/BetList.tsx`.
    - Use Thirdweb's `useReadContract` hook to fetch the list of all bets from the `rideTheBet` contract.
    - Map over the returned data and render a `BetCard` for each bet.
    ```typescript
    // Inside BetList.tsx
    import { useReadContract } from "thirdweb/react";
    import { getContract } from "thirdweb";
    // ... other imports

    const contract = getContract({ client, chain: spicyTestnet, address: RIDETHEBET_ADDRESS, abi: RIDETHEBET_ABI });

    const { data: bets, isLoading } = useReadContract({
        contract,
        method: "getBetCount"
        // You will need to fetch each bet individually or create a getter in the contract
    });
    ```

3.  **`CreateBet` Component (Writing Data):**
    - Create a form component `src/components/CreateBet.tsx`.
    - It will have inputs for description, stake amount, etc.
    - Use the `TransactionButton` component from Thirdweb to handle the transaction flow for creating a bet. This component handles `approve` and the contract call in one user-friendly flow.
    ```typescript
    // Inside CreateBet.tsx
    import { TransactionButton } from "thirdweb/react";
    import { prepareContractCall } from "thirdweb";
    // ... other imports

    <TransactionButton
      transaction={() => {
        // First, prepare the approval transaction for the MockPSG token
        // Then, prepare the createBet transaction
        return prepareContractCall({
          contract,
          method: "createBet",
          params: [description, MOCK_PSG_ADDRESS, stake, timestamp],
        });
      }}
    >
      Create Bet
    </TransactionButton>
    ```

4.  **Voting Logic (Upvote/Downvote):**
    - In the `BetCard.tsx` component, add `TransactionButton` components for "Upvote" and "Downvote".
    - These buttons will prepare and execute the `upvote` or `downvote` functions on the smart contract, similar to the `createBet` logic.

5.  **Claiming Winnings:**
    - For resolved bets, show a "Claim Winnings" button.
    - This `TransactionButton` will call the `claimWinnings` function.

---

## Phase 5: Final Touches & Submission (2-3 Hours)

**Goal:** Polish the UI, test thoroughly, and prepare for submission.

1.  **UI/UX Polish:**
    - Use Tailwind CSS and shadcn/ui components to make the dApp look professional.
    - Add loading states (e.g., spinners) while data is fetching or transactions are processing.
    - Add user feedback using a toast library like `react-hot-toast`.

2.  **End-to-End Testing:**
    - Get a second test wallet address.
    - Mint `MockPSG` tokens to both wallets using the `mint` function in Remix.
    - **Test the full user flow:**
        1.  Wallet 1: Create a bet.
        2.  Wallet 2: Downvote the bet.
        3.  Wallet 1: As the admin, resolve the bet.
        4.  Verify that the correct winner can claim the winnings.

3.  **Prepare Submission:**
    - Record a crisp, 2-3 minute video demonstrating the full, working user flow. This is your most important asset.
    - Write a clear `README.md` for your GitHub repository explaining the project, the problem it solves, and how to run it locally.
    - Deploy the frontend to a service like Vercel or Netlify for a live demo link.

