# Context Update 1: Implementing a Secure Curation Layer

This document outlines a critical architectural update to the `PredictionDuel` smart contract and dApp. The primary goal of this change is to enhance security and platform integrity by preventing users from creating subjective, ambiguous, or malicious bets.

### The Problem

The previous contract version allowed users to create a bet with a free-form `string memory description`. This posed a significant security risk:
-   A user could create a bet like "Will the sky be blue tomorrow?" which is impossible for an oracle to resolve fairly.
-   It opened the door for spam and abuse, cluttering the platform with invalid markets.
-   It made automating the oracle resolution process difficult and unreliable.

### The Solution: A Curation Layer

We have shifted to a model where the platform operator curates all available bets. This is achieved by separating the on-chain logic from the off-chain human-readable content.

#### Key Changes

1.  **Off-Chain Bet Catalog (`bet-catalog.json`)**
    -   A simple JSON file, managed by the platform admin, now serves as the single source of truth for all valid bets.
    -   It contains human-readable descriptions (`"PSG to win"`) and maps them to unique, structured IDs (`matchId: 101`, `betTypeId: 1`).

2.  **Smart Contract Modifications (`PredictionDuel_v2.sol`)**
    -   **Removed `description`:** The `Bet` struct no longer stores any descriptive strings, saving gas and removing the attack vector.
    -   **Added `BetIdentifier`:** A new `struct` and `mapping` (`betIdentifiers`) have been added to store the `matchId` and `betTypeId` on-chain for each duel.
    -   **Updated `createBet` Function:** The function signature has changed. It now accepts the structured IDs instead of a string:
        ```solidity
        function createBet(
            uint256 _matchId,
            uint8 _betTypeId,
            // ... other params
        ) public { ... }
        ```

3.  **Frontend Implications**
    -   The "Create Bet" UI must be changed. Instead of a text input for the description, it will now feature dropdown menus.
    -   The first dropdown will be populated with matches from the `bet-catalog.json`.
    -   The second dropdown will dynamically show the allowed bet types for the selected match.
    -   This new UI makes it impossible for a user to create a non-approved bet.

### Security Benefit

This new architecture makes the platform **secure by design**. By strictly controlling the inputs to the smart contract, we guarantee that every bet created is objective, verifiable, and can be correctly processed by our decentralized oracle. This eliminates an entire class of potential vulnerabilities and ensures a fair and reliable experience for all users.
