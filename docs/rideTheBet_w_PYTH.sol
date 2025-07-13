// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Standard OpenZeppelin imports
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// --- PYTH NETWORK INTEGRATION ---
// Import the Pyth Network interface to interact with the oracle.
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";


/**
 * @title PredictionDuel_Pyth_Integration
 * @author [Your Name/Team Name]
 * @notice A curated prediction market that demonstrates how to use a Pyth Network price feed
 * to set dynamic, USD-denominated minimum stakes for creating bets.
 */
contract PredictionDuel_Pyth_Integration is Ownable, ReentrancyGuard {

    // --- PYTH NETWORK STATE VARIABLES ---

    // The Pyth oracle contract address on the target network.
    IPyth private immutable i_pyth;

    // The unique ID for the price feed we want to query.
    // !!! IMPORTANT HACKATHON NOTE !!!
    // This is a HYPOTHETICAL Price Feed ID for PSG/USD.
    // As of July 2025, this feed does not exist on Pyth Network.
    // This implementation is for demonstration purposes to show how the integration
    // would work if the feed were available.
    bytes32 private immutable i_psgUsdPriceId;

    // The maximum age (in seconds) that a price update can be for it to be considered valid.
    // Set to 1 hour for demonstration; would be much shorter in production (e.g., 60 seconds).
    uint256 private constant MAX_PRICE_AGE = 3600; // 1 hour

    // The minimum stake required to create a bet, denominated in USD cents.
    // e.g., 500 = $5.00
    uint256 public minimumStakeInUsdCents;


    // --- CORE CONTRACT STATE VARIABLES ---

    Bet[] public bets;
    mapping(address => string) public influencerNames;
    mapping(bytes32 => address) private _registeredNameHashes;
    struct BetIdentifier { uint256 matchId; uint8 betTypeId; }
    struct Bet {
        address influencer;
        address tokenAddress;
        uint256 upvotePoolTotal;
        uint256 downvotePoolTotal;
        uint256 resolutionTimestamp;
        bool isResolved;
        bool influencerWasRight;
    }
    mapping(uint256 => BetIdentifier) public betIdentifiers;
    mapping(uint256 => mapping(address => uint256)) public upvoterStakes;
    mapping(uint256 => mapping(address => uint256)) public downvoterStakes;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;


    // --- Events ---
    event InfluencerRegistered(address indexed influencer, string name);
    event BetCreated(uint256 indexed betId, address indexed influencer, uint256 matchId, uint8 betTypeId, uint256 resolutionTimestamp);
    event Voted(uint256 indexed betId, address indexed user, uint256 amount, bool isUpvote);
    event BetResolved(uint256 indexed betId, bool influencerWasRight);
    event WinningsClaimed(uint256 indexed betId, address indexed user, uint256 totalPayout);


    // --- Constructor ---
    constructor(
        uint256 _initialMinimumStakeInUsdCents,
        address _pythAddress,
        bytes32 _hypotheticalPsgUsdPriceId,
        address initialOwner
    ) Ownable(initialOwner) {
        minimumStakeInUsdCents = _initialMinimumStakeInUsdCents;
        i_pyth = IPyth(_pythAddress);
        i_psgUsdPriceId = _hypotheticalPsgUsdPriceId;
    }


    // --- PYTH INTEGRATION FUNCTION ---

    /**
     * @notice Calculates the required minimum stake in PSG tokens based on the current
     * USD price from the Pyth oracle.
     * @return The minimum stake amount in PSG tokens (with 18 decimals).
     */
    function getMinimumStakeInPsg() public view returns (uint256) {
        // Get the latest price data from Pyth, ensuring it's not too old.
        PythStructs.Price memory price = i_pyth.getPriceNoOlderThan(i_psgUsdPriceId, MAX_PRICE_AGE);

        // price.price is the price of 1 PSG in USD (e.g., 250000000 for $2.50, with expo -8)
        // price.expo is the exponent (e.g., -8)
        // Actual price = price.price * (10^price.expo)

        require(price.price > 0, "Pyth: Invalid price");
        uint256 psgPriceInUsd = uint256(uint64(price.price));

        // To calculate required PSG, we use the formula:
        // RequiredPSG = (StakeInUSD) / (PriceOfPsgInUSD)
        // To handle decimals correctly:
        // RequiredPSG = (minimumStakeInUsdCents / 100) / (psgPriceInUsd * 10^expo)
        // Simplified with fixed-point math (multiplying by 1e18 for token decimals):
        // RequiredPSG = (minimumStakeInUsdCents * 1e18 * 10^(-expo)) / (psgPriceInUsd * 100)

        uint256 requiredPsgAmount;
        if (price.expo >= 0) {
            // This case is unlikely for token prices but included for completeness.
            uint256 powerOfTen = 10 ** uint256(int256(price.expo));
            requiredPsgAmount = (minimumStakeInUsdCents * 1e18 * powerOfTen) / (psgPriceInUsd * 100);
        } else {
            uint256 powerOfTen = 10 ** uint256(int256(-price.expo));
            requiredPsgAmount = (minimumStakeInUsdCents * 1e18) / (psgPriceInUsd * 100 * powerOfTen);
        }

        return requiredPsgAmount;
    }


    // --- CORE FUNCTIONS (MODIFIED) ---

    /**
     * @notice Creates a new prediction duel.
     * @dev MODIFIED: The require statement now calls getMinimumStakeInPsg() to check
     * against a dynamic, USD-based minimum stake.
     */
    function createBet(
        uint256 _matchId,
        uint8 _betTypeId,
        address _tokenAddress,
        uint256 _influencerStake,
        uint256 _resolutionTimestamp
    ) external nonReentrant {
        // DYNAMIC STAKE CHECK: Ensure the user's stake meets the current USD minimum.
        uint256 requiredStake = getMinimumStakeInPsg();
        require(_influencerStake >= requiredStake, "Stake is below the USD minimum");

        require(_tokenAddress != address(0), "Token address cannot be zero");
        require(_resolutionTimestamp > block.timestamp, "Resolution time must be in the future");

        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _influencerStake);

        uint256 betId = bets.length;
        upvoterStakes[betId][msg.sender] = _influencerStake;
        betIdentifiers[betId] = BetIdentifier(_matchId, _betTypeId);
        bets.push(Bet({
            influencer: msg.sender,
            tokenAddress: _tokenAddress,
            upvotePoolTotal: _influencerStake,
            downvotePoolTotal: 0,
            resolutionTimestamp: _resolutionTimestamp,
            isResolved: false,
            influencerWasRight: false
        }));

        emit BetCreated(betId, msg.sender, _matchId, _betTypeId, _resolutionTimestamp);
        emit Voted(betId, msg.sender, _influencerStake, true);
    }
    
    
    // --- UNCHANGED FUNCTIONS ---
    // The rest of your contract logic (voting, claiming, registration) remains the same.
    // Paste the other functions from your working `PredictionDuel_v2_fixed.sol` here.

    function registerInfluencer(string memory _name) external {
        require(bytes(_name).length > 0, "Name cannot be empty");
        bytes32 nameHash = keccak256(abi.encodePacked(_name));
        require(_registeredNameHashes[nameHash] == address(0), "Name is already taken");
        require(bytes(influencerNames[msg.sender]).length == 0, "Address has already registered a name");
        _registeredNameHashes[nameHash] = msg.sender;
        influencerNames[msg.sender] = _name;
        emit InfluencerRegistered(msg.sender, _name);
    }

    function upvote(uint256 _betId, uint256 _amount) external nonReentrant { _vote(_betId, _amount, true); }
    function downvote(uint256 _betId, uint256 _amount) external nonReentrant { _vote(_betId, _amount, false); }
    
    function claimWinnings(uint256 _betId) external nonReentrant {
        require(_betId < bets.length, "Bet does not exist");
        require(bets[_betId].isResolved, "Bet is not yet resolved");
        require(!hasClaimed[_betId][msg.sender], "Winnings already claimed");
        uint256 userUpvoteStake = upvoterStakes[_betId][msg.sender];
        uint256 userDownvoteStake = downvoterStakes[_betId][msg.sender];
        require(userUpvoteStake > 0 || userDownvoteStake > 0, "You did not participate");
        hasClaimed[_betId][msg.sender] = true;
        uint256 payout = 0;
        Bet memory bet = bets[_betId];
        if (bet.influencerWasRight) {
            if (userUpvoteStake > 0) {
                payout = userUpvoteStake;
                if (bet.upvotePoolTotal > 0 && bet.downvotePoolTotal > 0) {
                    payout += (userUpvoteStake * bet.downvotePoolTotal) / bet.upvotePoolTotal;
                }
            }
        } else {
            if (userDownvoteStake > 0) {
                payout = userDownvoteStake;
                if (bet.downvotePoolTotal > 0 && bet.upvotePoolTotal > 0) {
                    payout += (userDownvoteStake * bet.upvotePoolTotal) / bet.downvotePoolTotal;
                }
            }
        }
        if (payout > 0) {
            IERC20(bet.tokenAddress).transfer(msg.sender, payout);
        }
        emit WinningsClaimed(_betId, msg.sender, payout);
    }

    function resolveBet(uint256 _betId, bool _wasInfluencerRight) external onlyOwner {
        require(_betId < bets.length, "Bet does not exist");
        Bet storage bet = bets[_betId];
        require(!bet.isResolved, "Bet is already resolved");
        bet.isResolved = true;
        bet.influencerWasRight = _wasInfluencerRight;
        emit BetResolved(_betId, _wasInfluencerRight);
    }

    function _vote(uint256 _betId, uint256 _amount, bool _isUpvote) internal {
        require(_betId < bets.length, "Bet does not exist");
        require(_amount > 0, "Stake amount must be positive");
        Bet storage bet = bets[_betId];
        require(!bet.isResolved, "Bet is already resolved");
        require(block.timestamp < bet.resolutionTimestamp, "Voting period has ended");
        require(upvoterStakes[_betId][msg.sender] == 0 && downvoterStakes[_betId][msg.sender] == 0, "You have already voted");
        IERC20(bet.tokenAddress).transferFrom(msg.sender, address(this), _amount);
        if (_isUpvote) {
            upvoterStakes[_betId][msg.sender] = _amount;
            bet.upvotePoolTotal += _amount;
        } else {
            downvoterStakes[_betId][msg.sender] = _amount;
            bet.downvotePoolTotal += _amount;
        }
        emit Voted(_betId, msg.sender, _amount, _isUpvote);
    }
}
