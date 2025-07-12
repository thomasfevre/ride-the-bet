// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PredictionDuel_v2
 * @author [Your Name/Team Name]
 * @notice A curated prediction market. Bets are created using pre-defined IDs from an
 * off-chain catalog, preventing subjective or malicious bet creation. Users upvote or
 * downvote these curated bets, and the winning side shares the losing side's stake.
 */
contract PredictionDuel_v2 is Ownable, ReentrancyGuard {

    // --- State Variables ---

    uint256 public minimumInfluencerStake;
    Bet[] public bets;
    mapping(string => address) public influencerNames;
    mapping(address => string) public addressToinfluencerNames;

    // NEW: Struct to hold the verifiable identifiers for a bet.
    struct BetIdentifier {
        uint256 matchId;
        uint8 betTypeId;
    }

    // NEW: Mapping from our internal betId to the verifiable identifiers.
    mapping(uint256 => BetIdentifier) public betIdentifiers;

    mapping(uint256 => mapping(address => uint256)) public upvoterStakes;
    mapping(uint256 => mapping(address => uint256)) public downvoterStakes;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;


    // --- Structs ---

    struct Bet {
        address influencer;
        // REMOVED: string description;
        address tokenAddress;
        uint256 upvotePoolTotal;
        uint256 downvotePoolTotal;
        uint256 resolutionTimestamp;
        bool isResolved;
        bool influencerWasRight;
    }


    // --- Events ---

    event InfluencerRegistered(address indexed influencer, string name);
    // UPDATED: Event now emits structured IDs instead of a description string.
    event BetCreated(uint256 indexed betId, address indexed influencer, uint256 matchId, uint8 betTypeId, uint256 resolutionTimestamp);
    event Voted(uint256 indexed betId, address indexed user, uint256 amount, bool isUpvote);
    event BetResolved(uint256 indexed betId, bool influencerWasRight);
    event WinningsClaimed(uint256 indexed betId, address indexed user, uint256 totalPayout);


    // --- Constructor ---

    constructor(uint256 _initialMinimumStake, address initialOwner) Ownable(initialOwner) {
        minimumInfluencerStake = _initialMinimumStake;
    }


    // --- Public & External Functions ---

    function registerInfluencer(string memory _name) external {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(influencerNames[_name] == address(0), "Name is already registered");
        influencerNames[_name] = msg.sender;
        addressToinfluencerNames[msg.sender] = _name;
        emit InfluencerRegistered(msg.sender, _name);
    }

    function getInfluencerPseudoByAddress(address _address) external view returns (string memory name) {
        require(_address != address(0), "No address provided");
        return addressToinfluencerNames[_address];
    }

    /**
     * @notice Creates a new prediction duel using structured IDs from the off-chain catalog.
     * @param _matchId The ID for the match (e.g., 101 for PSG vs Man City).
     * @param _betTypeId The ID for the specific prediction type (e.g., 1 for "PSG to win").
     * @param _tokenAddress The contract address of the Fan Token being staked.
     * @param _influencerStake The amount of tokens the influencer is staking.
     * @param _resolutionTimestamp The future timestamp when the outcome will be known.
     */
    function createBet(
        uint256 _matchId,
        uint8 _betTypeId,
        address _tokenAddress,
        uint256 _influencerStake,
        uint256 _resolutionTimestamp
    ) external nonReentrant {
        require(_influencerStake >= minimumInfluencerStake, "Stake is below minimum");
        require(_tokenAddress != address(0), "Token address cannot be zero");
        require(_resolutionTimestamp > block.timestamp, "Resolution time must be in the future");

        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _influencerStake);

        uint256 betId = bets.length;
        upvoterStakes[betId][msg.sender] = _influencerStake;

        // Store the structured identifiers
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

    function upvote(uint256 _betId, uint256 _amount) external nonReentrant {
        _vote(_betId, _amount, true);
    }

    function downvote(uint256 _betId, uint256 _amount) external nonReentrant {
        _vote(_betId, _amount, false);
    }

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
            if (userUpvoteStake > 0 && bet.upvotePoolTotal > 0) {
                uint256 winnings = (userUpvoteStake * bet.downvotePoolTotal) / bet.upvotePoolTotal;
                payout = userUpvoteStake + winnings;
            }
        } else {
            if (userDownvoteStake > 0 && bet.downvotePoolTotal > 0) {
                uint256 winnings = (userDownvoteStake * bet.upvotePoolTotal) / bet.downvotePoolTotal;
                payout = userDownvoteStake + winnings;
            }
        }

        if (payout > 0) {
            IERC20(bet.tokenAddress).transfer(msg.sender, payout);
        }

        emit WinningsClaimed(_betId, msg.sender, payout);
    }


    // --- Owner-Only & Internal Functions ---

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
    
    // --- Admin & View Functions ---

    function setMinimumStake(uint256 _newAmount) external onlyOwner {
        minimumInfluencerStake = _newAmount;
    }

    function getBetCount() external view returns (uint256) {
        return bets.length;
    }
}
